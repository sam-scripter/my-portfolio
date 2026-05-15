import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import dotenv from 'dotenv'

dotenv.config()

// Plugins
import redisPlugin from './plugins/redis'
import dbPlugin from './plugins/db'

// Routes
import { chatRoutes } from './routes/chat'
import { githubRoutes } from './routes/github'
import { projectRoutes } from './routes/projects'
import { adminRoutes } from './routes/admin'

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  },
})

// ── Plugins ───────────────────────────────────────────────────────────
app.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']
    : true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
})

app.register(cookie)
app.register(redisPlugin)
app.register(dbPlugin)

// ── Routes ────────────────────────────────────────────────────────────
app.register(chatRoutes)
app.register(githubRoutes)
app.register(projectRoutes)
app.register(adminRoutes)

// ── Health check ──────────────────────────────────────────────────────
app.get('/health', async () => {
  return {
    status: 'ok',
    service: 'backend-node',
    timestamp: new Date().toISOString(),
  }
})

// ── Start ─────────────────────────────────────────────────────────────
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`Fastify running on http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()