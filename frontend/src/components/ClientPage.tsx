//CLientPage.tsx

'use client'

import { useState } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Hero } from './sections/Hero'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'
import { GitHubActivity } from './sections/GithubActivity'
import { Timeline } from './sections/Timeline'
import { Contact } from './sections/Contact'
import { Project, SkillsByCategory, AvailabilityStatus } from '@/types'

interface ClientPageProps {
  projects: Project[]
  skills: SkillsByCategory
  availability: AvailabilityStatus
}

export function ClientPage({ projects, skills, availability }: ClientPageProps) {
  // Chat widget open state lives here so Navbar and Contact
  // can both trigger it without prop drilling through every section
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <>
      <Navbar onOpenChat={() => setChatOpen(true)} />

      <main>
        <Hero availability={availability} onOpenChat={() => setChatOpen(true)} />
        <Projects projects={projects} />
        <Skills skills={skills} />
        <GitHubActivity />
        <Timeline />
        <Contact onOpenChat={() => setChatOpen(true)} />
      </main>

      <Footer />

      {/* Chat widget will be added in Phase 6 */}
      {/* <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} /> */}
    </>
  )
}