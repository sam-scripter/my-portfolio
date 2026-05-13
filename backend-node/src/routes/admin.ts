import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { requireAdmin } from '../middleware/auth'

export async function adminRoutes(fastify: FastifyInstance) {

  // Apply admin auth to all routes in this function
  fastify.addHook('preHandler', requireAdmin)

  const ragUrl = process.env.RAG_SERVICE_URL || 'http://localhost:8000'

  // ── POST /api/admin/auth — validate admin secret, set cookie ──────
  // Called by the admin login form. Returns a token the frontend
  // stores in sessionStorage for subsequent requests.
  fastify.post('/api/admin/auth', { config: { skipAdminAuth: true } }, async (request, reply) => {
    // This route validates the secret and returns confirmation.
    // The frontend then stores the secret in sessionStorage and
    // sends it as Bearer token on all subsequent admin requests.
    const body = request.body as any
    if (body?.secret === process.env.ADMIN_SECRET) {
      return reply.send({ success: true, message: 'Authenticated' })
    }
    return reply.status(401).send({ success: false, message: 'Invalid secret' })
  })

  // ── GET /api/admin/projects — all projects including archived ─────
  fastify.get('/api/admin/projects', async (request, reply) => {
    const result = await fastify.db.query(
      'SELECT * FROM projects ORDER BY display_order ASC'
    )
    return reply.send({ success: true, data: result.rows })
  })

  // ── POST /api/admin/projects — create new project ─────────────────
  fastify.post('/api/admin/projects', async (request, reply) => {
    const b = request.body as any
    try {
      const result = await fastify.db.query(`
        INSERT INTO projects
          (title, slug, short_description, case_study, tech_stack,
           github_url, playstore_url, live_url, status, featured, display_order)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *
      `, [
        b.title, b.slug, b.short_description, b.case_study,
        b.tech_stack || [], b.github_url || '', b.playstore_url || '',
        b.live_url || '', b.status || 'in_progress',
        b.featured || false, b.display_order || 99,
      ])

      const newProject = result.rows[0]

      // Auto-ingest the case_study into the knowledge base
      // so the AI knows about the new project immediately
      if (b.case_study) {
        try {
          await axios.post(`${ragUrl}/ingest`, {
            file_content: b.case_study,
            source_name: `projects/${b.slug}`,
          }, { timeout: 30000 })
          fastify.log.info(`Knowledge base updated for project: ${b.slug}`)
        } catch (ingestErr) {
          // Ingestion failed — project still created, just log the error
          fastify.log.error({ ingestErr }, 'Auto-ingestion failed for new project')
        }
      }

      return reply.status(201).send({ success: true, data: newProject })
    } catch (err: any) {
      fastify.log.error({ err }, 'Failed to create project')
      return reply.status(500).send({ success: false, message: err.message })
    }
  })

  // ── PUT /api/admin/projects/:id — update project ──────────────────
  fastify.put('/api/admin/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const b = request.body as any
    try {
      const result = await fastify.db.query(`
        UPDATE projects SET
          title=$1, short_description=$2, case_study=$3,
          tech_stack=$4, github_url=$5, playstore_url=$6,
          live_url=$7, status=$8, featured=$9,
          display_order=$10, updated_at=now()
        WHERE id=$11
        RETURNING *
      `, [
        b.title, b.short_description, b.case_study,
        b.tech_stack || [], b.github_url || '', b.playstore_url || '',
        b.live_url || '', b.status, b.featured,
        b.display_order, id,
      ])

      if (result.rows.length === 0) {
        return reply.status(404).send({ success: false, message: 'Project not found' })
      }

      // Re-ingest if case_study was updated
      if (b.case_study && b.slug) {
        try {
          await axios.post(`${ragUrl}/ingest`, {
            file_content: b.case_study,
            source_name: `projects/${b.slug}`,
          }, { timeout: 30000 })
        } catch { /* log but don't fail the update */ }
      }

      return reply.send({ success: true, data: result.rows[0] })
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message })
    }
  })

  // ── DELETE /api/admin/projects/:id — soft delete (archive) ────────
  fastify.delete('/api/admin/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await fastify.db.query(
      "UPDATE projects SET status='archived', updated_at=now() WHERE id=$1",
      [id]
    )
    return reply.send({ success: true, message: 'Project archived' })
  })

  // ── PUT /api/admin/settings/:key — update a site setting ──────────
  fastify.put('/api/admin/settings/:key', async (request, reply) => {
    const { key } = request.params as { key: string }
    const { value } = request.body as { value: string }
    await fastify.db.query(
      'UPDATE site_settings SET value=$1, updated_at=now() WHERE key=$2',
      [value, key]
    )
    return reply.send({ success: true, message: `Setting '${key}' updated` })
  })

  // ── GET /api/admin/analytics — chat analytics ─────────────────────
  fastify.get('/api/admin/analytics', async (request, reply) => {
    try {
      const [volumeRes, modeRes, topQRes, offTopicRes] = await Promise.all([
        // Daily volume — last 30 days
        fastify.db.query(`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM chat_logs
          WHERE created_at > NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `),
        // Mode breakdown
        fastify.db.query(`
          SELECT mode, COUNT(*) as count
          FROM chat_logs
          WHERE created_at > NOW() - INTERVAL '30 days'
          GROUP BY mode
        `),
        // Top 15 questions
        fastify.db.query(`
          SELECT question, COUNT(*) as count
          FROM chat_logs
          WHERE off_topic = false
            AND created_at > NOW() - INTERVAL '30 days'
          GROUP BY question
          ORDER BY count DESC
          LIMIT 15
        `),
        // Off-topic rate
        fastify.db.query(`
          SELECT
            COUNT(*) FILTER (WHERE off_topic = true) as off_topic_count,
            COUNT(*) as total
          FROM chat_logs
          WHERE created_at > NOW() - INTERVAL '30 days'
        `),
      ])

      return reply.send({
        success: true,
        data: {
          daily_volume: volumeRes.rows,
          mode_breakdown: modeRes.rows,
          top_questions: topQRes.rows,
          off_topic_rate: offTopicRes.rows[0],
        },
      })
    } catch (err) {
      return reply.status(500).send({ success: false, message: 'Analytics query failed' })
    }
  })

  // ── GET /api/admin/settings — all settings ────────────────────────────
  fastify.get('/api/admin/settings', async (request, reply) => {
    const result = await fastify.db.query(
      'SELECT key, value FROM site_settings ORDER BY key'
    )
    const data: Record<string, string> = {}
    for (const row of result.rows) {
      data[row.key] = row.value
    }
    return reply.send({ success: true, data })
  })

  // ── POST /api/admin/ingest — trigger full knowledge base re-ingest ─
  fastify.post('/api/admin/ingest', async (request, reply) => {
    try {
      const result = await axios.post(`${ragUrl}/ingest`, {}, { timeout: 120000 })
      return reply.send({ success: true, data: result.data })
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        message: 'Ingestion failed',
        detail: err.message,
      })
    }
  })
}