import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import dotenv from 'dotenv'
import redisPlugin from './plugins/redis'

dotenv.config()

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  },
})

// ── Plugins ──────────────────────────────────────────────────────────
app.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://shadivahlabs.com']
    : ['http://localhost:3000'],
  credentials: true,
})

app.register(cookie)
app.register(redisPlugin)

// ── Health check ─────────────────────────────────────────────────────
app.get('/health', async () => {
  return { status: 'ok', service: 'backend-node', timestamp: new Date().toISOString() }
})

// ── Start ─────────────────────────────────────────────────────────────
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`Server running on http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()