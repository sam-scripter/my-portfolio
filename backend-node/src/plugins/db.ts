import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import { Pool } from 'pg'

// Extend Fastify's type system so every route knows fastify.db exists
declare module 'fastify' {
  interface FastifyInstance {
    db: Pool
  }
}

const dbPlugin: FastifyPluginAsync = async (fastify) => {
  // Pool manages multiple connections efficiently.
  // Instead of opening/closing a connection per request,
  // the pool keeps connections alive and reuses them.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,                // maximum simultaneous connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  // Test connection on startup
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    fastify.log.info('PostgreSQL connected successfully')
  } catch (err) {
    fastify.log.error({ err }, 'PostgreSQL connection failed')
  }

  // Attach pool to Fastify — routes use fastify.db.query(...)
  fastify.decorate('db', pool)

  // Clean shutdown — drain all connections when server stops
  fastify.addHook('onClose', async () => {
    await pool.end()
    fastify.log.info('PostgreSQL pool closed')
  })
}

export default fp(dbPlugin, { name: 'db' })