// ── Project ───────────────────────────────────────────────────────────
export interface Project {
  id: string
  title: string
  slug: string
  short_description: string
  case_study?: string
  tech_stack: string[]
  github_url: string
  playstore_url: string
  live_url: string
  status: 'live' | 'in_progress' | 'archived'
  featured: boolean
  display_order: number
  created_at: string
}

// ── Skill ─────────────────────────────────────────────────────────────
export interface Skill {
  name: string
  proficiency: number // 1-5
}

export interface SkillsByCategory {
  [category: string]: Skill[]
}

// ── GitHub ────────────────────────────────────────────────────────────
export interface GitHubRepo {
  name: string
  description: string
  url: string
  stars: number
  language: string | null
  language_color: string | null
  updated_at: string
  topics: string[]
}

export interface GitHubCommit {
  repo: string
  commits: number
  date: string
  message: string
}

export interface GitHubData {
  profile: {
    login: string
    name: string
    public_repos: number
    followers: number
  }
  pinned_repos: GitHubRepo[]
  recent_commits: GitHubCommit[]
  cached_at: string
  cached: boolean
  stale?: boolean
}

// ── Chat ──────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  mode?: ChatMode
}

export type ChatMode = 'visitor' | 'recruiter'

// ── Fit Analysis ──────────────────────────────────────────────────────
export interface FitRequirement {
  requirement: string
  evidence: string
  matched: boolean
}

export interface FitReport {
  overall_score: number
  summary: string
  requirements: FitRequirement[]
  gaps: string[]
  suggested_questions: string[]
}

// ── Site Settings ─────────────────────────────────────────────────────
export type AvailabilityStatus = 'open' | 'not_looking'

export interface SiteSettings {
  availability_status: AvailabilityStatus
}