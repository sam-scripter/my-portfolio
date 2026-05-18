'use client'

import { useState, useEffect } from 'react'
import {
  verifyAdminSecret,
  adminGetProjects,
  adminCreateProject,
  adminUpdateProject,
  adminDeleteProject,
  adminGetSettings,
  adminUpdateSetting,
  adminGetAnalytics,
  adminTriggerIngest,
} from '@/lib/adminApi'

// ── Tab type ──────────────────────────────────────────────────────────
type Tab = 'projects' | 'analytics' | 'settings' | 'knowledge'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [secret, setSecret] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('projects')

  // Check if already authenticated this session
  useEffect(() => {
    const token = sessionStorage.getItem('adminToken')
    if (token) setAuthed(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError('')
    const ok = await verifyAdminSecret(secret)
    if (ok) {
      setAuthed(true)
    } else {
      setLoginError('Invalid secret')
    }
    setLoggingIn(false)
  }

  // ── Login screen ────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-text-primary">Admin Dashboard</h1>
            <p className="text-text-muted text-sm mt-1">Enter your admin secret to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="Admin secret"
              className="w-full px-4 py-3 text-sm bg-surface-2 border border-border rounded-xl text-text-primary placeholder:text-text-muted outline-none focus:border-primary-400 transition-colors"
              autoFocus
            />
            {loginError && (
              <p className="text-red-500 text-xs">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn || !secret}
              className="w-full py-3 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loggingIn ? 'Verifying...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Authenticated dashboard ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-surface-2 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <span className="font-semibold text-text-primary">Admin Dashboard</span>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem('adminToken'); setAuthed(false) }}
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Sign out
        </button>
      </header>

      {/* Tab nav */}
      <div className="border-b border-border px-6">
        <div className="flex gap-1 -mb-px">
          {(['projects', 'analytics', 'settings', 'knowledge'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize',
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-text-muted hover:text-text-primary',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'knowledge' && <KnowledgeTab />}
      </div>
    </div>
  )
}

// ── Projects Tab ──────────────────────────────────────────────────────
function ProjectsTab() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<any | null>(null)

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await adminGetProjects()
      setProjects(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [])

  const handleArchive = async (id: string, title: string) => {
    if (!confirm(`Archive "${title}"? It will be hidden from the portfolio.`)) return
    await adminDeleteProject(id)
    loadProjects()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Projects</h2>
        <button
          onClick={() => { setEditingProject(null); setShowForm(true) }}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all"
        >
          + Add project
        </button>
      </div>

      {/* Project form */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onSave={async (data) => {
            if (editingProject) {
              await adminUpdateProject(editingProject.id, data)
            } else {
              await adminCreateProject(data)
            }
            setShowForm(false)
            setEditingProject(null)
            loadProjects()
          }}
          onCancel={() => { setShowForm(false); setEditingProject(null) }}
        />
      )}

      {/* Project list */}
      {loading ? (
        <p className="text-text-muted text-sm">Loading...</p>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <div
              key={project.id}
              className="flex items-center gap-4 p-4 bg-surface-2 border border-border rounded-xl"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-text-primary truncate">
                    {project.title}
                  </h3>
                  <span className={[
                    'text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                    project.status === 'live'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : project.status === 'archived'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                  ].join(' ')}>
                    {project.status}
                  </span>
                  {project.featured && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 flex-shrink-0">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted truncate">{project.short_description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => { setEditingProject(project); setShowForm(true) }}
                  className="px-3 py-1.5 text-xs text-text-secondary border border-border rounded-lg hover:border-primary-300 hover:text-text-primary transition-all"
                >
                  Edit
                </button>
                {project.status !== 'archived' && (
                  <button
                    onClick={() => handleArchive(project.id, project.title)}
                    className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Project Form ──────────────────────────────────────────────────────
function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project: any | null
  onSave: (data: any) => Promise<void>
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: project?.title || '',
    slug: project?.slug || '',
    short_description: project?.short_description || '',
    case_study: project?.case_study || '',
    tech_stack: project?.tech_stack?.join(', ') || '',
    github_url: project?.github_url || '',
    playstore_url: project?.playstore_url || '',
    live_url: project?.live_url || '',
    status: project?.status || 'in_progress',
    featured: project?.featured || false,
    display_order: project?.display_order || 99,
  })

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...form,
        tech_stack: form.tech_stack.split(',').map((t: string) => t.trim()).filter(Boolean),
        display_order: Number(form.display_order),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-6 p-6 bg-surface-2 border border-border rounded-xl">
      <h3 className="text-base font-semibold text-text-primary mb-5">
        {project ? `Edit: ${project.title}` : 'New Project'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Title" required>
            <input
              value={form.title}
              onChange={e => setForm(f => ({
                ...f,
                title: e.target.value,
                slug: project ? f.slug : autoSlug(e.target.value),
              }))}
              required
              className={inputClass}
              placeholder="Project title"
            />
          </FormField>
          <FormField label="Slug" required>
            <input
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              required
              className={inputClass}
              placeholder="url-safe-slug"
            />
          </FormField>
        </div>

        <FormField label="Short description">
          <textarea
            value={form.short_description}
            onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
            rows={2}
            className={inputClass}
            placeholder="2-3 sentence summary for the project card"
          />
        </FormField>

        <FormField label="Case study (Markdown)">
          <textarea
            value={form.case_study}
            onChange={e => setForm(f => ({ ...f, case_study: e.target.value }))}
            rows={10}
            className={[inputClass, 'font-mono text-xs'].join(' ')}
            placeholder="Full case study in Markdown..."
          />
        </FormField>

        <FormField label="Tech stack (comma-separated)">
          <input
            value={form.tech_stack}
            onChange={e => setForm(f => ({ ...f, tech_stack: e.target.value }))}
            className={inputClass}
            placeholder="Flutter, Dart, Firebase"
          />
        </FormField>

        <div className="grid md:grid-cols-3 gap-4">
          <FormField label="GitHub URL">
            <input
              value={form.github_url}
              onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))}
              className={inputClass}
              placeholder="https://github.com/..."
            />
          </FormField>
          <FormField label="Play Store URL">
            <input
              value={form.playstore_url}
              onChange={e => setForm(f => ({ ...f, playstore_url: e.target.value }))}
              className={inputClass}
              placeholder="https://play.google.com/..."
            />
          </FormField>
          <FormField label="Live URL">
            <input
              value={form.live_url}
              onChange={e => setForm(f => ({ ...f, live_url: e.target.value }))}
              className={inputClass}
              placeholder="https://..."
            />
          </FormField>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <FormField label="Status">
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className={inputClass}
            >
              <option value="live">Live</option>
              <option value="in_progress">In Progress</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>
          <FormField label="Display order">
            <input
              type="number"
              value={form.display_order}
              onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
              className={inputClass}
            />
          </FormField>
          <FormField label="Featured">
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                className="w-4 h-4 accent-primary-600"
              />
              <label htmlFor="featured" className="text-sm text-text-secondary">
                Show as featured card
              </label>
            </div>
          </FormField>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-all"
          >
            {saving ? 'Saving...' : (project ? 'Save changes' : 'Create project')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 text-sm text-text-secondary border border-border rounded-lg hover:border-primary-300 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Analytics Tab ─────────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetAnalytics()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-text-muted text-sm">Loading analytics...</p>
  if (!data) return <p className="text-text-muted text-sm">Failed to load analytics.</p>

  const total = data.off_topic_rate?.total || 0
  const offTopicCount = data.off_topic_rate?.off_topic_count || 0
  const offTopicPct = total > 0 ? Math.round((offTopicCount / total) * 100) : 0

  const visitorCount = data.mode_breakdown?.find((r: any) => r.mode === 'visitor')?.count || 0
  const recruiterCount = data.mode_breakdown?.find((r: any) => r.mode === 'recruiter')?.count || 0

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-text-primary">Analytics (last 30 days)</h2>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total messages', value: total },
          { label: 'Visitor mode', value: visitorCount },
          { label: 'Recruiter mode', value: recruiterCount },
          { label: 'Off-topic rate', value: `${offTopicPct}%` },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-2 border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-text-primary mb-1">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Top questions */}
      {data.top_questions?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Top questions asked</h3>
          <div className="space-y-2">
            {data.top_questions.map((row: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 px-4 py-2.5 bg-surface-2 border border-border rounded-lg"
              >
                <p className="text-sm text-text-secondary truncate flex-1">{row.question}</p>
                <span className="text-xs font-medium text-text-muted flex-shrink-0 bg-surface-3 px-2 py-0.5 rounded-full">
                  {row.count}×
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily volume */}
      {data.daily_volume?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Daily message volume</h3>
          <div className="flex items-end gap-1 h-24">
            {data.daily_volume.map((row: any) => {
              const max = Math.max(...data.daily_volume.map((r: any) => Number(r.count)))
              const pct = max > 0 ? (Number(row.count) / max) * 100 : 0
              return (
                <div
                  key={row.date}
                  className="flex-1 bg-primary-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${Math.max(pct, 4)}%` }}
                  title={`${row.date}: ${row.count} messages`}
                />
              )
            })}
          </div>
          <p className="text-xs text-text-muted mt-1">Last 30 days</p>
        </div>
      )}

      {total === 0 && (
        <p className="text-text-muted text-sm">
          No chat activity yet. Once visitors start using the AI assistant, stats will appear here.
        </p>
      )}
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────
function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    adminGetSettings()
      .then(res => setSettings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateSetting = async (key: string, value: string) => {
    setSaving(key)
    try {
      await adminUpdateSetting(key, value)
      setSettings(prev => ({ ...prev, [key]: value }))
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <p className="text-text-muted text-sm">Loading settings...</p>

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-lg font-semibold text-text-primary">Site Settings</h2>

      {/* Availability status */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Availability Status</h3>
        <p className="text-xs text-text-muted mb-4">
          Controls the badge shown on your portfolio hero section.
        </p>
        <div className="flex gap-3">
          {[
            { value: 'open', label: 'Open to opportunities', color: 'bg-green-500' },
            { value: 'not_looking', label: 'Not currently looking', color: 'bg-gray-400' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateSetting('availability_status', option.value)}
              disabled={saving === 'availability_status'}
              className={[
                'flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm transition-all',
                settings['availability_status'] === option.value
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-border text-text-secondary hover:border-primary-300',
              ].join(' ')}
            >
              <span className={['w-2 h-2 rounded-full flex-shrink-0', option.color].join(' ')} />
              <span className="text-xs">{option.label}</span>
              {saved === 'availability_status' && settings['availability_status'] === option.value && (
                <span className="ml-auto text-xs text-green-600">Saved ✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Daily cap */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Global Daily Message Cap</h3>
        <p className="text-xs text-text-muted mb-4">
          Maximum total AI messages per day across all visitors. Protects your API budget.
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            value={settings['daily_cap'] || '500'}
            onChange={e => setSettings(prev => ({ ...prev, daily_cap: e.target.value }))}
            className={[inputClass, 'flex-1'].join(' ')}
            min={10}
            max={10000}
          />
          <button
            onClick={() => updateSetting('daily_cap', settings['daily_cap'] || '500')}
            disabled={saving === 'daily_cap'}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-all"
          >
            {saved === 'daily_cap' ? 'Saved ✓' : saving === 'daily_cap' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Knowledge Tab ─────────────────────────────────────────────────────
function KnowledgeTab() {
  const [ingesting, setIngesting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleIngest = async () => {
    if (!confirm('Re-ingest all knowledge base documents? This will re-embed all files and update the AI\'s knowledge.')) return
    setIngesting(true)
    setResult(null)
    setError('')
    try {
      const res = await adminTriggerIngest()
      setResult(res)
    } catch (err: any) {
      setError(err.message || 'Ingestion failed')
    } finally {
      setIngesting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-lg font-semibold text-text-primary">Knowledge Base</h2>

      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Re-ingest Documents</h3>
        <p className="text-xs text-text-muted mb-4 leading-relaxed">
          Re-reads all <code className="bg-surface-3 px-1 rounded text-xs">knowledge/*.md</code> files,
          re-generates embeddings, and updates the vector database. Run this after editing
          knowledge documents or adding new project write-ups.
        </p>

        <button
          onClick={handleIngest}
          disabled={ingesting}
          className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {ingesting ? (
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Re-ingesting...
            </span>
          ) : (
            'Re-ingest all documents'
          )}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
              Ingestion complete ✓
            </p>
            <div className="text-xs text-green-600 dark:text-green-500 space-y-1">
              <p>Chunks added: {result.data?.chunks_added ?? 0}</p>
              <p>Chunks updated: {result.data?.chunks_updated ?? 0}</p>
              <p>Sources: {result.data?.sources_processed?.join(', ')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">When to re-ingest</h3>
        <ul className="text-xs text-text-muted space-y-1.5 leading-relaxed">
          <li>· After adding a new project via the Projects tab</li>
          <li>· After editing any file in <code className="bg-surface-3 px-1 rounded">knowledge/</code></li>
          <li>· After adding a new <code className="bg-surface-3 px-1 rounded">.md</code> file to the knowledge folder</li>
          <li>· The AI will immediately reflect the updated knowledge after ingestion</li>
        </ul>
      </div>
    </div>
  )
}

// ── Shared helpers ────────────────────────────────────────────────────
const inputClass = 'w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted outline-none focus:border-primary-400 transition-colors'

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}