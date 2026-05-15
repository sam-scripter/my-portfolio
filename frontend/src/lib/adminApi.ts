/**
 * Admin API Client
 * =================
 * All admin API calls go through here.
 * Every request sends the admin secret as a Bearer token.
 * The secret is stored in sessionStorage after login —
 * it never touches a cookie or localStorage.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('adminToken') || ''
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  })

  if (res.status === 401) {
    // Token expired or wrong — clear it and force re-login
    sessionStorage.removeItem('adminToken')
    throw new Error('UNAUTHORIZED')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `API error ${res.status}`)
  }

  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────
export async function verifyAdminSecret(secret: string): Promise<boolean> {
  try {
    await fetch(`${API_URL}/api/admin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    }).then(r => {
      if (!r.ok) throw new Error('Invalid')
    })
    sessionStorage.setItem('adminToken', secret)
    return true
  } catch {
    return false
  }
}

// ── Projects ──────────────────────────────────────────────────────────
export async function adminGetProjects() {
  return adminFetch<{ success: boolean; data: any[] }>('/api/admin/projects')
}

export async function adminCreateProject(data: any) {
  return adminFetch('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function adminUpdateProject(id: string, data: any) {
  return adminFetch(`/api/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function adminDeleteProject(id: string) {
  return adminFetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
}

// ── Settings ──────────────────────────────────────────────────────────
export async function adminGetSettings() {
  return adminFetch<{ success: boolean; data: Record<string, string> }>(
    '/api/admin/settings'
  )
}

export async function adminUpdateSetting(key: string, value: string) {
  return adminFetch(`/api/admin/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  })
}

// ── Analytics ─────────────────────────────────────────────────────────
export async function adminGetAnalytics() {
  return adminFetch<{ success: boolean; data: any }>('/api/admin/analytics')
}

// ── Knowledge base ────────────────────────────────────────────────────
export async function adminTriggerIngest() {
  return adminFetch('/api/admin/ingest', { method: 'POST', body: JSON.stringify({}) })
}