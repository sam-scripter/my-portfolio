import Fastify, { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import Redis from 'ioredis'

// We declare this on the Fastify instance so TypeScript knows
// that fastify.redis exists everywhere in the app
declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

const redisPlugin: FastifyPluginAsync = async (fastify) => {
  // Create the Redis connection using the URL from .env
  // ioredis automatically handles reconnection if Redis restarts
  const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    // If Redis is down, don't crash the whole app — just log the error
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  })

  // Test the connection on startup
  try {
    await redis.connect()
    await redis.ping()
    fastify.log.info('Redis connected successfully')
  } catch (err) {
    // Log the error but don't crash — the app can run without Redis,
    // rate limiting just won't work until Redis comes back
    fastify.log.error({ err }, 'Redis connection failed')
  }

  // Attach the redis client to the Fastify instance
  // Now any route can do: fastify.redis.get('key')
  fastify.decorate('redis', redis)

  // When Fastify shuts down, close the Redis connection cleanly
  fastify.addHook('onClose', async () => {
    await redis.quit()
    fastify.log.info('Redis connection closed')
  })
}

// fp() (fastify-plugin) makes the decoration available to the
// whole app, not just the plugin's scope. Without fp(), the
// fastify.redis decoration would only exist inside this plugin.
export default fp(redisPlugin, {
  name: 'redis',
})