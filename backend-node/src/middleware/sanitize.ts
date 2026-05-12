import { FastifyRequest, FastifyReply } from 'fastify'

// Prompt injection patterns to flag at the gateway level.
// The Python service has its own classifier too — this is
// an additional layer that catches attempts before they
// even reach the RAG service.
const INJECTION_PATTERNS = [
  /ignore (your|previous|all) instructions/i,
  /forget (you are|your role)/i,
  /you are now/i,
  /new (persona|role|instructions)/i,
  /developer mode/i,
  /jailbreak/i,
]

export async function sanitizeInput(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const body = request.body as any

  if (!body || typeof body.message !== 'string') {
    reply.status(400).send({
      success: false,
      code: 'INVALID_INPUT',
      message: 'message field is required and must be a string',
    })
    return
  }

  // ── Length check ─────────────────────────────────────────────────
  if (body.message.length > 500) {
    reply.status(400).send({
      success: false,
      code: 'MESSAGE_TOO_LONG',
      message: 'Message must be 500 characters or less',
    })
    return
  }

  // ── Strip HTML tags ───────────────────────────────────────────────
  // Prevents XSS if message content is ever rendered without escaping
  body.message = body.message.replace(/<[^>]*>/g, '').trim()

  // ── Validate mode ─────────────────────────────────────────────────
  if (body.mode && !['visitor', 'recruiter'].includes(body.mode)) {
    body.mode = 'visitor' // silently correct invalid mode
  }

  // ── Validate session_history length ──────────────────────────────
  // Prevents context stuffing — someone sending 100 fake history
  // messages to manipulate the AI's context
  if (body.session_history && body.session_history.length > 20) {
    body.session_history = body.session_history.slice(-20)
  }

  // ── Log injection attempts (don't block — Python handles it) ──────
  // We log here for analytics but let Python's classifier handle the
  // actual response. This avoids duplicating decline logic.
  const hasInjection = INJECTION_PATTERNS.some(p => p.test(body.message))
  if (hasInjection) {
    request.log.warn({ message: body.message }, 'Potential prompt injection attempt flagged at gateway')
  }
}