import { ChatPageClient } from '@/components/chat/ChatPageClient'
import { getProjects, getSkills } from '@/lib/api'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Samuel's AI Assistant — Ask me anything",
  description:
    "Talk to Samuel Shadiva's AI assistant. Ask about his skills, projects, and experience — or paste a job description to get a fit analysis.",
}

export const revalidate = 3600

export default async function ChatPage() {
  const [projects, skills] = await Promise.all([
    getProjects().catch(() => []),
    getSkills().catch(() => ({})),
  ])

  return <ChatPageClient projects={projects} skills={skills} />
}