import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { checkRateLimit } from '../middleware/rateLimit'
import { sanitizeInput } from '../middleware/sanitize'

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post('/api/chat', async (request, reply) => {
    // Step 1: Sanitize and validate input
    await sanitizeInput(request, reply)
    if (reply.sent) return // sanitize sent a 400 — stop here

    // Step 2: Check rate limits
    await checkRateLimit(request, reply)
    if (reply.sent) return // rate limit hit — stop here

    const body = request.body as any
    const ragUrl = process.env.RAG_SERVICE_URL || 'http://localhost:8000'

    try {
      // Step 3: Forward to Python RAG service as a streaming request
      // responseType: 'stream' tells axios not to buffer the response —
      // we want to pipe it directly back to the client
      const ragResponse = await axios.post(
        `${ragUrl}/chat`,
        {
          message: body.message,
          mode: body.mode || 'visitor',
          session_history: body.session_history || [],
          session_id: body.session_id || 'anonymous',
          job_description: body.job_description || null,
        },
        {
          responseType: 'stream',
          timeout: 60000, // 60 seconds — long enough for slow LLM responses
          headers: { 'Content-Type': 'application/json' },
        }
      )

      // Step 4: Set SSE headers on the response to the browser
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',   // disables Nginx buffering for SSE
        'Connection': 'keep-alive',
        'X-RateLimit-Remaining': reply.getHeader('X-RateLimit-Remaining') || '0',
        'X-RateLimit-Limit': reply.getHeader('X-RateLimit-Limit') || '20',
      })

      // Step 5: Pipe the RAG service stream directly to the browser
      // This is the most efficient approach — no buffering, no copying,
      // tokens flow from OpenAI → Python → Fastify → Browser in real time
      ragResponse.data.pipe(reply.raw)

      // Handle stream end
      ragResponse.data.on('end', () => {
        reply.raw.end()
      })

      // Handle RAG service errors mid-stream
      ragResponse.data.on('error', (err: Error) => {
        fastify.log.error({ err }, 'RAG stream error')
        if (!reply.raw.writableEnded) {
          reply.raw.write(`data: {"error": "Stream interrupted"}\n\n`)
          reply.raw.write('data: [DONE]\n\n')
          reply.raw.end()
        }
      })

    } catch (err: any) {
      fastify.log.error({ err }, 'Failed to connect to RAG service')

      if (!reply.sent) {
        reply.status(503).send({
          success: false,
          code: 'RAG_UNAVAILABLE',
          message: 'The AI service is temporarily unavailable. Please try again in a moment.',
        })
      }
    }
  })

  // ── Fit Analysis Proxy ────────────────────────────────────────────
  // Not streaming — single JSON response, simpler proxy
  fastify.post('/api/analyze-fit', async (request, reply) => {
    const body = request.body as any
    const ragUrl = process.env.RAG_SERVICE_URL || 'http://localhost:8000'

    if (!body?.job_description) {
      return reply.status(400).send({
        success: false,
        code: 'MISSING_JD',
        message: 'job_description is required',
      })
    }

    try {
      const ragResponse = await axios.post(
        `${ragUrl}/chat/analyze-fit`,
        { job_description: body.job_description },
        { timeout: 60000 }
      )
      return reply.send(ragResponse.data)
    } catch (err: any) {
      fastify.log.error({ err }, 'Fit analysis failed')
      return reply.status(503).send({
        success: false,
        code: 'ANALYSIS_FAILED',
        message: 'Fit analysis is temporarily unavailable.',
      })
    }
  })
}