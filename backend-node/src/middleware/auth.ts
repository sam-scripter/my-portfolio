import { FastifyRequest, FastifyReply } from 'fastify'

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Expect: Authorization: Bearer <ADMIN_SECRET>
  const authHeader = request.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Admin access requires Authorization: Bearer <token>',
    })
    return
  }

  const token = authHeader.slice(7) // remove "Bearer "
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret || token !== adminSecret) {
    reply.status(401).send({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Invalid admin token',
    })
    return
  }

  // Auth passed — request proceeds to the route handler
}