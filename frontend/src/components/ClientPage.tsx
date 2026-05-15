'use client'

import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Projects } from './sections/Projects'
import { GitHubActivity } from './sections/GithubActivity'
import { Timeline } from './sections/Timeline'
import { Contact } from './sections/Contact'
import { Project, AvailabilityStatus } from '@/types'

interface ClientPageProps {
  projects: Project[]
  availability: AvailabilityStatus
}

export function ClientPage({ projects, availability }: ClientPageProps) {
  return (
    <>
      <Navbar />

      <main>
        <Hero availability={availability} />
        <About />
        <Projects projects={projects} />
        <Timeline />
        {/* <GitHubActivity /> */}
        <Contact />
      </main>

      <Footer />
    </>
  )
}
