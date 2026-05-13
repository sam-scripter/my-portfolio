'use client'

import { useEffect, useState } from 'react'
import { Star, GitCommit, ExternalLink } from 'lucide-react'
import { GitHubData } from '@/types'
import { getGitHubData } from '@/lib/api'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { formatDate, getLanguageColor } from '@/lib/utils'

interface Repo {
  name: string
  description: string
  url: string
  stars: number
  language: string | null
  language_color: string | null
  updated_at: string
  topics: string[]
}

interface Commit {
  repo: string
  commits: number
  date: string
  message: string
}

export function GitHubActivity() {
  const [data, setData] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getGitHubData()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-24 max-w-6xl mx-auto px-6">
      <SectionHeader title="Currently Building" subtitle="Live GitHub activity — updated hourly." />

      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-surface-2 border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <p className="text-text-muted text-sm">
          GitHub data temporarily unavailable.{' '}
          <a
            href="https://github.com/Sam-scripter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            View profile directly →
          </a>
        </p>
      )}

      {data && (
        <>
          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mb-10 text-sm text-text-secondary">
            <span className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-text-muted">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <strong className="text-text-primary">{data.profile.public_repos}</strong> public repos
            </span>
            <span className="flex items-center gap-2">
              <GitCommit size={15} />
              <strong className="text-text-primary">{data.recent_commits.length}</strong> commits in last 30 days
            </span>
            {(data.cached || data.stale) && (
              <span className="text-text-muted text-xs ml-auto">
                Updated {formatDate(data.cached_at)}
              </span>
            )}
          </div>

          {/* Pinned repos */}
          {data.pinned_repos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.pinned_repos.map((repo: Repo) => (
                <Card key={repo.name} hover className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-text-primary">{repo.name}</h3>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-text-primary transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  {repo.description && (
                    <p className="text-xs text-text-secondary mb-4 leading-relaxed line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getLanguageColor(repo.language) }}
                        />
                        {repo.language}
                      </span>
                    )}
                    {repo.stars > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={11} />
                        {repo.stars}
                      </span>
                    )}
                    <span className="ml-auto">{formatDate(repo.updated_at)}</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Fallback: show recent commits if no pinned repos */
            <div className="space-y-3">
              {data.recent_commits.length > 0 ? (
                data.recent_commits.slice(0, 5).map((commit: Commit, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-3 border-b border-border last:border-0"
                  >
                    <GitCommit size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary truncate">
                        {commit.message || 'Commit'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {commit.repo} · {formatDate(commit.date)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text-muted text-sm">
                  Add a GitHub personal access token to show pinned repos.{' '}
                  <a
                    href="https://github.com/Sam-scripter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    View profile →
                  </a>
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}