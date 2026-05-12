import { FastifyRequest, FastifyReply } from 'fastify'
import { createHash } from 'crypto'

// How many seconds until midnight UTC — used for TTL and Retry-After header
function secondsUntilMidnightUTC(): number {
  const now = new Date()
  const midnight = new Date()
  midnight.setUTCHours(24, 0, 0, 0)
  return Math.floor((midnight.getTime() - now.getTime()) / 1000)
}

// Hash the IP with a salt — never store raw IPs
// The salt means hashes can't be reversed even if the DB is leaked
function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'samuel-portfolio-salt'
  return createHash('sha256').update(ip + salt).digest('hex')
}

// Today's date string used as part of Redis keys — ensures daily reset
function todayKey(): string {
  return new Date().toISOString().split('T')[0] // "2026-05-12"
}

export async function checkRateLimit(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const redis = request.server.redis
  const sessionId = (request.body as any)?.session_id || 'anonymous'
  const clientIP = request.ip || '0.0.0.0'
  const ipHash = hashIP(clientIP)
  const today = todayKey()

  // ── Check 1: Session limit (10 messages per session) ─────────────
  // Resets when the session expires (1 hour of inactivity)
  const sessionKey = `rl:session:${sessionId}`
  const sessionCount = await redis.incr(sessionKey)
  if (sessionCount === 1) {
    // First message in this session — set TTL of 1 hour
    await redis.expire(sessionKey, 3600)
  }

  if (sessionCount > Number(process.env.RATE_LIMIT_PER_SESSION || 10)) {
    reply.status(429).send({
      success: false,
      code: 'SESSION_LIMIT',
      message: "You've reached the limit for this session. Start a new session or come back later.",
      contact: 'shadivasam@gmail.com',
      remaining: 0,
    })
    return
  }

  // ── Check 2: IP daily limit (20 messages per IP per day) ──────────
  // Resets at midnight UTC automatically via Redis TTL
  const ipKey = `rl:ip:${ipHash}:${today}`
  const ipCount = await redis.incr(ipKey)
  if (ipCount === 1) {
    // First message from this IP today — set TTL until midnight
    await redis.expire(ipKey, secondsUntilMidnightUTC())
  }

  const ipLimit = Number(process.env.RATE_LIMIT_PER_IP_DAILY || 20)
  if (ipCount > ipLimit) {
    reply.status(429).send({
      success: false,
      code: 'DAILY_LIMIT',
      message: `You've reached today's limit of ${ipLimit} messages. Come back tomorrow or contact Samuel directly.`,
      contact: 'shadivasam@gmail.com',
      retryAfter: secondsUntilMidnightUTC(),
      remaining: 0,
    })
    return
  }

  // ── Check 3: Global daily cap (500 total across all users) ────────
  // Protects against viral traffic or bot abuse draining the API budget
  const globalKey = `rl:global:${today}`
  const globalCount = await redis.incr(globalKey)
  if (globalCount === 1) {
    await redis.expire(globalKey, secondsUntilMidnightUTC())
  }

  // Read the cap from DB site_settings (allows admin to change it live)
  // Fall back to env var if DB read fails
  let globalCap = Number(process.env.RATE_LIMIT_GLOBAL_DAILY || 500)
  try {
    const result = await request.server.db.query(
      "SELECT value FROM site_settings WHERE key = 'daily_cap'"
    )
    if (result.rows.length > 0) {
      globalCap = Number(result.rows[0].value)
    }
  } catch {
    // DB read failed — use env var fallback, don't crash
  }

  if (globalCount > globalCap) {
    reply.status(429).send({
      success: false,
      code: 'GLOBAL_LIMIT',
      message: "The assistant is temporarily unavailable due to high demand. Please try again tomorrow or contact Samuel directly.",
      contact: 'shadivasam@gmail.com',
      remaining: 0,
    })
    return
  }

  // ── All checks passed — attach remaining count to request ─────────
  // The route handler reads this and sends it back as a header
  // so the frontend can show "X messages remaining today"
  const remaining = Math.max(0, ipLimit - ipCount)
  reply.header('X-RateLimit-Remaining', remaining.toString())
  reply.header('X-RateLimit-Limit', ipLimit.toString())
}