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
import { ChatWidget } from './chat/ChatWidget'
import { Project, SkillsByCategory, AvailabilityStatus } from '@/types'

interface ClientPageProps {
  projects: Project[]
  skills: SkillsByCategory
  availability: AvailabilityStatus
}

export function ClientPage({ projects, skills, availability }: ClientPageProps) {
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

      {/* Floating chat trigger button — visible when widget is closed */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          aria-label="Open AI assistant"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  )
}