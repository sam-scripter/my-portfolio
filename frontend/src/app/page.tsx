import { getProjects, getSettings } from '@/lib/api'
import { ClientPage } from '@/components/ClientPage'

export const revalidate = 3600

export default async function Home() {
  const [projects, settingsData] = await Promise.all([
    getProjects().catch(() => []),
    getSettings().catch(() => ({ availability_status: 'open' as const })),
  ])

  return (
    <ClientPage
      projects={projects}
      availability={settingsData.availability_status}
    />
  )
}