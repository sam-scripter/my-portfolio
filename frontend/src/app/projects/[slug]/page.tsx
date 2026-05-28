import { getProject, getProjects } from '@/lib/api'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { ArrowLeft, Smartphone, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { getStatusConfig } from '@/lib/utils'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateStaticParams() {
  const projects = await getProjects().catch(() => [])
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug).catch(() => null)
  if (!project) return {}

  const title = project.title
  const description = project.short_description
  const url = `https://shadivahlabs.com/projects/${slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'Samuel Shadiva',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical: url },
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProject(slug).catch(() => null)

  if (!project) notFound()

  const status = getStatusConfig(project.status)

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">

        {/* Back link */}
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-10"
        >
          <ArrowLeft size={15} />
          Back to projects
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-4xl font-bold text-text-primary">{project.title}</h1>
            <span
              className={[
                'text-xs font-mono px-3 py-1 rounded-full flex-shrink-0',
                status.variant === 'live'
                  ? 'bg-[rgba(100,255,218,0.08)] text-[#64ffda] border border-[rgba(100,255,218,0.2)]'
                  : status.variant === 'progress'
                  ? 'bg-[rgba(239,159,39,0.08)] text-[#EF9F27] border border-[rgba(239,159,39,0.2)]'
                  : 'bg-[rgba(255,255,255,0.04)] text-[#4a5568] border border-[rgba(255,255,255,0.08)]',
              ].join(' ')}
            >
              {status.label}
            </span>
          </div>

          <p className="text-text-secondary text-lg leading-relaxed mb-6">
            {project.short_description}
          </p>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tech_stack.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-4">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary border border-border px-4 py-2 rounded-lg transition-all hover:border-primary-300"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                View on GitHub
              </a>
            )}

            {project.playstore_url && (
              <a
                href={project.playstore_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary border border-border px-4 py-2 rounded-lg transition-all hover:border-primary-300"
              >
                <Smartphone size={15} />
                Play Store
              </a>
            )}

            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary border border-border px-4 py-2 rounded-lg transition-all hover:border-primary-300"
              >
                <ExternalLink size={15} />
                Live Site
              </a>
            )}
          </div>
        </div>

        {/* Case study content */}
        {project.case_study && (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-text-primary prose-headings:font-semibold prose-p:text-text-secondary prose-p:leading-relaxed prose-li:text-text-secondary prose-li:leading-relaxed prose-strong:text-text-primary prose-strong:font-semibold prose-a:text-primary-600 prose-a:no-underline prose-code:text-primary-600 prose-code:bg-surface-2 prose-code:rounded prose-hr:border-border">
            <ReactMarkdown>{project.case_study}</ReactMarkdown>
          </div>
        )}

      </div>
    </div>
  )
}