import { Suspense } from 'react'
import { getProjects, getSkills, getSettings } from '@/lib/api'
import { ClientPage } from '@/components/ClientPage'

// This page uses Next.js ISR — it rebuilds every hour automatically.
// New projects added via the admin panel appear within 60 minutes
// without any redeploy.
export const revalidate = 3600

export default async function Home() {
  // Fetch data server-side — fast, no loading spinners for core content
  const [projects, skills, settingsData] = await Promise.all([
    getProjects().catch(() => []),
    getSkills().catch(() => ({})),
    getSettings().catch(() => ({ availability_status: 'open' as const })),
  ])

  return (
    <ClientPage
      projects={projects}
      skills={skills}
      availability={settingsData.availability_status}
    />
  )
}