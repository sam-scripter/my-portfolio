/**
 * API Client
 * ===========
 * All calls to the Fastify backend go through this file.
 * The NEXT_PUBLIC_API_URL env var controls which backend
 * is used (localhost in dev, your domain in production).
 */

import { Project, SkillsByCategory, GitHubData, FitReport, SiteSettings } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ── Generic fetch helper ──────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`)
  }

  const json = await res.json()
  return json.data ?? json
}

// ── Projects ──────────────────────────────────────────────────────────
export async function getProjects(): Promise<Project[]> {
  return apiFetch<Project[]>('/api/projects')
}

export async function getProject(slug: string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${slug}`)
}

// ── Skills ────────────────────────────────────────────────────────────
export async function getSkills(): Promise<SkillsByCategory> {
  return apiFetch<SkillsByCategory>('/api/skills')
}

// ── GitHub ────────────────────────────────────────────────────────────
export async function getGitHubData(): Promise<GitHubData> {
  return apiFetch<GitHubData>('/api/github')
}

// ── Settings ──────────────────────────────────────────────────────────
export async function getSettings(): Promise<SiteSettings> {
  return apiFetch<SiteSettings>('/api/settings')
}

// ── Fit Analysis ──────────────────────────────────────────────────────
export async function analyzeFit(jobDescription: string): Promise<FitReport> {
  return apiFetch<FitReport>('/api/analyze-fit', {
    method: 'POST',
    body: JSON.stringify({ job_description: jobDescription }),
  })
}