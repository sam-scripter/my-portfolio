import { FastifyInstance } from 'fastify'
import axios from 'axios'

const CACHE_KEY = 'cache:github'
const CACHE_TTL = 3600 // 1 hour in seconds

export async function githubRoutes(fastify: FastifyInstance) {
  fastify.get('/api/github', async (request, reply) => {
    const redis = fastify.redis
    const username = process.env.GITHUB_USERNAME || 'Sam-scripter'
    const token = process.env.GITHUB_TOKEN

    // ── Check Redis cache first ───────────────────────────────────
    try {
      const cached = await redis.get(CACHE_KEY)
      if (cached) {
        const data = JSON.parse(cached)
        return reply.send({ ...data, cached: true })
      }
    } catch {
      // Cache miss or Redis error — fetch from GitHub
    }

    // ── Fetch from GitHub API ─────────────────────────────────────
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'samuel-portfolio',
    }
    if (token && token !== 'ghp_placeholder') {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      // Fetch user profile + recent events in parallel
      const [userRes, eventsRes] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`, { headers }),
        axios.get(`https://api.github.com/users/${username}/events?per_page=30`, { headers }),
      ])

      const user = userRes.data

      // Extract push events from the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentCommits = eventsRes.data
        .filter((e: any) => e.type === 'PushEvent')
        .filter((e: any) => new Date(e.created_at) > thirtyDaysAgo)
        .slice(0, 10)
        .map((e: any) => ({
          repo: e.repo.name.replace(`${username}/`, ''),
          commits: e.payload.commits?.length || 0,
          date: e.created_at,
          message: e.payload.commits?.[0]?.message?.split('\n')[0] || '',
        }))

      // Fetch pinned repos using GraphQL API
      // REST API doesn't expose pinned repos — GraphQL does
      let pinnedRepos: any[] = []
      if (token && token !== 'ghp_placeholder') {
        try {
          const graphqlRes = await axios.post(
            'https://api.github.com/graphql',
            {
              query: `{
                user(login: "${username}") {
                  pinnedItems(first: 6, types: REPOSITORY) {
                    nodes {
                      ... on Repository {
                        name
                        description
                        url
                        stargazerCount
                        primaryLanguage { name color }
                        updatedAt
                        repositoryTopics(first: 5) {
                          nodes { topic { name } }
                        }
                      }
                    }
                  }
                }
              }`
            },
            { headers }
          )

          pinnedRepos = graphqlRes.data?.data?.user?.pinnedItems?.nodes || []
        } catch {
          // GraphQL failed — skip pinned repos, show what we have
        }
      }

      const responseData = {
        profile: {
          login: user.login,
          name: user.name,
          public_repos: user.public_repos,
          followers: user.followers,
        },
        pinned_repos: pinnedRepos.map((r: any) => ({
          name: r.name,
          description: r.description,
          url: r.url,
          stars: r.stargazerCount,
          language: r.primaryLanguage?.name || null,
          language_color: r.primaryLanguage?.color || null,
          updated_at: r.updatedAt,
          topics: r.repositoryTopics?.nodes?.map((t: any) => t.topic.name) || [],
        })),
        recent_commits: recentCommits,
        cached_at: new Date().toISOString(),
        cached: false,
      }

      // Store in Redis for 1 hour
      await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(responseData))

      return reply.send(responseData)

    } catch (err: any) {
      fastify.log.error({ err }, 'GitHub API fetch failed')

      // Try to return stale cache rather than a 500 error
      try {
        const stale = await redis.get(CACHE_KEY)
        if (stale) {
          return reply.send({ ...JSON.parse(stale), stale: true })
        }
      } catch { /* no cache available */ }

      return reply.status(503).send({
        success: false,
        code: 'GITHUB_UNAVAILABLE',
        message: 'GitHub data temporarily unavailable',
      })
    }
  })
}