'use client'

import { useState } from 'react'
import { ExternalLink, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { Project } from '@/types'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { SectionHeader } from '../ui/SectionHeader'
import { getStatusConfig } from '@/lib/utils'

interface ProjectsProps {
  projects: Project[]
}

const FILTER_OPTIONS = ['All', 'Flutter', 'Python', 'AI', 'Node.js', 'Django', 'React.js']

export function Projects({ projects }: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered =
    activeFilter === 'All'
      ? projects
      : projects.filter((p) => p.tech_stack.includes(activeFilter))

  const featured = filtered.filter((p) => p.featured)
  const rest = filtered.filter((p) => !p.featured)

  return (
    <section id="work" className="py-24 max-w-6xl mx-auto px-6">
      <SectionHeader
        title="Work &amp; Projects"
        subtitle="A selection of systems I've built — from production mobile apps to autonomous AI pipelines."
      />

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTER_OPTIONS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              activeFilter === tag
                ? 'bg-primary-600 text-white'
                : 'bg-surface-2 text-text-secondary border border-border hover:border-primary-300',
            ].join(' ')}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Featured — large cards */}
      {featured.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} featured />
          ))}
        </div>
      )}

      {/* Rest — smaller cards */}
      {rest.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-text-muted text-center py-12">No projects match that filter.</p>
      )}
    </section>
  )
}

interface ProjectCardProps {
  project: Project
  featured?: boolean
}

function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const status = getStatusConfig(project.status)
  const maxTags = featured ? 6 : 4

  return (
    <Card hover className={featured ? 'p-7' : 'p-5'}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className={['font-semibold text-text-primary', featured ? 'text-xl' : 'text-base'].join(' ')}>
          {project.title}
        </h3>
        <span className={['text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0', status.color].join(' ')}>
          {status.label}
        </span>
      </div>

      {/* Description */}
      <p className={['text-text-secondary leading-relaxed mb-4', featured ? 'text-sm' : 'text-xs'].join(' ')}>
        {project.short_description}
      </p>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {project.tech_stack.slice(0, maxTags).map((tech) => (
          <Badge key={tech} variant="outline" className="text-xs">
            {tech}
          </Badge>
        ))}
        {project.tech_stack.length > maxTags && (
          <Badge variant="outline" className="text-xs">
            +{project.tech_stack.length - maxTags}
          </Badge>
        )}
      </div>

      {/* Links */}
      <div className="flex items-center gap-3 pt-3 border-t border-border flex-wrap">
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
        )}
        {project.playstore_url && (
          <a
            href={project.playstore_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <Smartphone size={13} />
            Play Store
          </a>
        )}
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <ExternalLink size={13} />
            Live
          </a>
        )}
        <Link
          href={'/projects/' + project.slug}
          className="ml-auto text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors"
        >
          Case study →
        </Link>
      </div>
    </Card>
  )
}