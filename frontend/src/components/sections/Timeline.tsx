import { SectionHeader } from '../ui/SectionHeader'

interface TimelineEntry {
  date: string
  title: string
  org: string
  type: 'work' | 'education'
  description: string[]
  current?: boolean
}

const TIMELINE: TimelineEntry[] = [
  {
    date: 'Current',
    title: 'ICT Platform Developer',
    org: 'Kenya School of Government',
    type: 'work',
    current: true,
    description: [
      'Building a full ICT asset management and service desk platform',
      'Docker deployment on Oracle Cloud VPS with Nginx and SSL',
      'Real-time WebSocket notifications with Socket.io',
    ],
  },
  {
    date: 'May 2025 – Present',
    title: 'MSc Information Technology',
    org: 'Strathmore University',
    type: 'education',
    current: true,
    description: [
      'Focus: Business Intelligence & Data Analytics',
      'Part-time evening programme — expected June 2027',
    ],
  },
  {
    date: 'Sep 2025, Feb 2026',
    title: 'Lead Technical Instructor',
    org: 'Sabatia Vocational College',
    type: 'work',
    description: [
      'Led mobile development workshops teaching Flutter and Kotlin',
      'Designed and delivered full curriculum from setup to deployment',
    ],
  },
  {
    date: 'Jan 2025 – Nov 2025',
    title: 'Mobile & Backend Developer',
    org: 'IVY Community',
    type: 'work',
    description: [
      'Built vendor management system with Flutter and Django',
      'Developed Measurement API using OpenPose computer vision',
      'Led R&D on SMPLX 3D body mesh generation',
    ],
  },
  {
    date: 'May 2023 – Aug 2023',
    title: 'Backend Developer',
    org: 'Uasin Gishu County Government',
    type: 'work',
    description: [
      'Built fuel and repair requisition system replacing paper process',
      'Google Maps API integration for automated fuel quota calculation',
    ],
  },
  {
    date: 'Sep 2020 – Oct 2024',
    title: 'BSc Computer Science',
    org: 'Catholic University of Eastern Africa',
    type: 'education',
    description: [
      'Second Class Upper Division',
      'Final project: Integrated Vehicle Management System (IVMS)',
    ],
  },
]

export function Timeline() {
  return (
    <section id="experience" className="py-24 bg-surface-2">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          title="Experience & Education"
          subtitle="Where I've worked and studied."
        />

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] md:left-1/2 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-10">
            {TIMELINE.map((entry, i) => (
              <div key={i} className={`relative flex gap-6 md:gap-0 ${
                i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}>
                {/* Content */}
                <div className={`flex-1 md:w-[calc(50%-2rem)] ml-8 md:ml-0 ${
                  i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                }`}>
                  <div className="bg-surface border border-border rounded-xl p-5">
                    {/* Date */}
                    <span className="text-xs font-medium text-primary-500 mb-1 block">
                      {entry.date}
                    </span>

                    {/* Title and org */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-base font-semibold text-text-primary">
                        {entry.title}
                      </h3>
                      {entry.current && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full flex-shrink-0">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-3">
                      {entry.org}
                    </p>

                    {/* Details */}
                    <ul className="space-y-1">
                      {entry.description.map((point, j) => (
                        <li key={j} className="text-xs text-text-secondary flex gap-2">
                          <span className="text-primary-400 mt-0.5 flex-shrink-0">·</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Dot on the line */}
                <div className="absolute left-0 md:left-1/2 top-6 w-3.5 h-3.5 rounded-full border-2 border-primary-500 bg-surface -translate-x-[3px] md:-translate-x-1/2 flex-shrink-0" />

                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}