import { FastifyInstance } from 'fastify'

export async function projectRoutes(fastify: FastifyInstance) {

  // ── GET /api/projects — all non-archived projects ─────────────────
  // Returns the list view (no case_study — too large for cards)
  fastify.get('/api/projects', async (request, reply) => {
    try {
      const result = await fastify.db.query(`
        SELECT
          id, title, slug, short_description,
          tech_stack, github_url, playstore_url, live_url,
          status, featured, display_order, created_at
        FROM projects
        WHERE status != 'archived'
        ORDER BY display_order ASC
      `)
      return reply.send({ success: true, data: result.rows })
    } catch (err) {
      fastify.log.error({ err }, 'Failed to fetch projects')
      return reply.status(500).send({ success: false, message: 'Failed to fetch projects' })
    }
  })

  // ── GET /api/projects/:slug — single project with case study ──────
  fastify.get('/api/projects/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    try {
      const result = await fastify.db.query(
        'SELECT * FROM projects WHERE slug = $1 AND status != $2',
        [slug, 'archived']
      )
      if (result.rows.length === 0) {
        return reply.status(404).send({ success: false, message: 'Project not found' })
      }
      return reply.send({ success: true, data: result.rows[0] })
    } catch (err) {
      fastify.log.error({ err }, 'Failed to fetch project')
      return reply.status(500).send({ success: false, message: 'Failed to fetch project' })
    }
  })

  // ── GET /api/skills — all skills grouped by category ─────────────
  fastify.get('/api/skills', async (request, reply) => {
    try {
      const result = await fastify.db.query(`
        SELECT name, category, proficiency, display_order
        FROM skills
        ORDER BY category, display_order ASC
      `)

      // Group by category for the frontend
      const grouped: Record<string, any[]> = {}
      for (const row of result.rows) {
        if (!grouped[row.category]) grouped[row.category] = []
        grouped[row.category].push({
          name: row.name,
          proficiency: row.proficiency,
        })
      }

      return reply.send({ success: true, data: grouped })
    } catch (err) {
      fastify.log.error({ err }, 'Failed to fetch skills')
      return reply.status(500).send({ success: false, message: 'Failed to fetch skills' })
    }
  })

  // ── GET /api/settings — public site settings ──────────────────────
  // Returns availability_status for the hero badge
  fastify.get('/api/settings', async (request, reply) => {
    try {
      const result = await fastify.db.query(
        "SELECT key, value FROM site_settings WHERE key = 'availability_status'"
      )
      const settings: Record<string, string> = {}
      for (const row of result.rows) {
        settings[row.key] = row.value
      }
      return reply.send({ success: true, data: settings })
    } catch (err) {
      return reply.status(500).send({ success: false, message: 'Failed to fetch settings' })
    }
  })
}