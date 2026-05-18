'use client'

import { useState } from 'react'
import { ExternalLink, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { Project } from '@/types'
import { Badge } from '../ui/Badge'
import { getStatusConfig } from '@/lib/utils'

interface ProjectsProps {
  projects: Project[]
}

const FILTERS = ['All', 'Flutter', 'Python', 'AI', 'Node.js', 'Django', 'React.js']

function GithubIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

const INITIAL_REST = 3

export function Projects({ projects }: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showAll, setShowAll] = useState(false)

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.tech_stack.includes(activeFilter))

  const featured = filtered.filter(p => p.featured)
  const rest = filtered.filter(p => !p.featured)
  const visibleRest = showAll ? rest : rest.slice(0, INITIAL_REST)
  const hasMore = rest.length > INITIAL_REST

  const handleFilterChange = (f: string) => {
    setActiveFilter(f)
    setShowAll(false)
  }

  return (
    <section id="work" className="py-24">
      <div className="max-w-5xl mx-auto px-6">

        {/* Section header */}
        <div className="mb-12">
          <p className="font-mono text-sm text-[#64ffda] mb-3">02. Work</p>
          <h2 className="font-display text-3xl font-bold text-[#ccd6f6] mb-3">
            <span className="text-[#64ffda]">Projects </span> &amp; Systems
          </h2>
          <p className="text-[#8892b0] text-sm mb-4 max-w-2xl">
            A selection of products I&apos;ve shipped end-to-end, plus the autonomous
            agents I&apos;ve built to automate real-world workflows.
          </p>
          <div className="w-16 h-px bg-[rgba(100,255,218,0.3)]" />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={[
                'font-mono text-xs px-3 py-1.5 rounded border transition-all duration-200',
                activeFilter === f
                  ? 'bg-[rgba(100,255,218,0.1)] text-[#64ffda] border-[rgba(100,255,218,0.4)]'
                  : 'text-[#8892b0] border-[rgba(255,255,255,0.08)] hover:border-[rgba(100,255,218,0.25)] hover:text-[#ccd6f6]',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Featured projects */}
        {featured.length > 0 && (
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {featured.map(p => (
              <ProjectCard key={p.id} project={p} featured />
            ))}
          </div>
        )}

        {/* Other projects */}
        {visibleRest.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleRest.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {/* View more / collapse */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAll(v => !v)}
              className="font-mono text-sm text-[#64ffda] border border-[rgba(100,255,218,0.3)] px-6 py-2.5 rounded hover:bg-[rgba(100,255,218,0.08)] transition-all duration-200 inline-flex items-center gap-2"
            >
              {showAll ? 'Show less' : `View more (${rest.length - INITIAL_REST} more)`}
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                className={`transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <p className="font-mono text-sm text-[#4a5568] text-center py-16">
            No projects match that filter.
          </p>
        )}
      </div>
    </section>
  )
}

function ProjectCard({ project, featured = false }: {
  project: Project
  featured?: boolean
}) {
  const { label, variant } = getStatusConfig(project.status)
  const maxTags = featured ? 5 : 4

  return (
    <div className={[
      'group relative flex flex-col rounded-xl border transition-all duration-300',
      'bg-[#0a192f] border-[rgba(255,255,255,0.08)]',
      'hover:border-[rgba(100,255,218,0.25)] hover:-translate-y-1',
      featured ? 'border-l-2 border-l-[rgba(100,255,218,0.4)] p-6' : 'p-5',
    ].join(' ')}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Folder icon */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(100,255,218,0.6)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>

        {/* Links */}
        <div className="flex items-center gap-3">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer"
              className="text-[#8892b0] hover:text-[#64ffda] transition-colors">
              <GithubIcon size={16} />
            </a>
          )}
          {project.playstore_url && (
            <a href={project.playstore_url} target="_blank" rel="noopener noreferrer"
              className="text-[#8892b0] hover:text-[#64ffda] transition-colors">
              <Smartphone size={16} />
            </a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer"
              className="text-[#8892b0] hover:text-[#64ffda] transition-colors">
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Title + status */}
      <div className="flex items-center gap-2 mb-2">
        <Link
          href={'/projects/' + project.slug}
          className="font-semibold text-[#ccd6f6] hover:text-[#64ffda] transition-colors"
          style={{ fontSize: featured ? '18px' : '15px' }}
        >
          {project.title}
        </Link>
        <Badge variant={variant}>{label}</Badge>
      </div>

      {/* Description */}
      <p className="text-[#8892b0] text-sm leading-relaxed mb-5 flex-1">
        {project.short_description}
      </p>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-2 mt-auto">
        {project.tech_stack.slice(0, maxTags).map(tech => (
          <span key={tech} className="font-mono text-xs text-[#8892b0]">
            {tech}
          </span>
        ))}
        {project.tech_stack.length > maxTags && (
          <span className="font-mono text-xs text-[#4a5568]">
            +{project.tech_stack.length - maxTags}
          </span>
        )}
      </div>

      {/* Case study link */}
      <Link
        href={'/projects/' + project.slug}
        className="mt-4 font-mono text-xs text-[#64ffda] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity inline-flex items-center gap-1"
      >
        View case study
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </Link>
    </div>
  )
}