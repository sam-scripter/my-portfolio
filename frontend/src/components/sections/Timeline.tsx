'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const ROLES = [
  {
    role: 'ICT Platform Developer',
    org: 'Kenya School of Government',
    period: 'Current',
    current: true,
    bullets: [
      'Full ICT asset management and service desk platform built with Node.js/Express.',
      'Docker deployment on Oracle Cloud VPS with Nginx and SSL.',
      'Real-time WebSocket notifications with Socket.io.',
    ],
  },
  {
    role: 'Lead Technical Instructor',
    org: 'Sabatia Vocational College',
    period: 'Sep 2025 · Feb 2026',
    current: false,
    bullets: [
      'Designed and delivered intensive training in Mobile Development (Kotlin) and Applied AI.',
      'Mentored developers through hands-on workshops on integrating LLM endpoints into mobile applications.',
      'Strong technical communication: breaking complex ML concepts into actionable lessons.',
    ],
  },
  {
    role: 'Mobile & Backend Developer',
    org: 'IVY Community',
    period: 'Jan 2025 – Nov 2025',
    current: false,
    bullets: [
      'Architected a comprehensive cross-platform vendor management system using Flutter and Django with real-time inventory tracking.',
      'Developed a custom Computer Vision Measurement API to extract body metrics from 2D photos for a virtual fashion system.',
      'Led R&D on 3D body modeling, prototyping SMPLX integration to create rotatable 3D avatars for virtual outfit fitting.',
    ],
  },
  {
    role: 'Backend Developer',
    org: 'Uasin Gishu County Government',
    period: 'May 2023 – Aug 2023',
    current: false,
    bullets: [
      'Spearheaded the Fuel and Repair Order Management System, replacing a manual paper requisition process.',
      'Implemented Google Maps API to calculate precise distances for fuel quotas, directly mitigating fuel theft.',
      'Managed the PostgreSQL schema handling complex departmental relations.',
    ],
  },
]

const EDUCATION = [
  {
    title: 'M.Sc. Information Technology',
    org: 'Strathmore University',
    period: 'May 2025 – Jun 2027 (expected)',
    note: 'Focus: Business Intelligence & Data Analytics · Part-time evenings',
  },
  {
    title: 'B.Sc. Computer Science',
    org: 'The Catholic University of Eastern Africa',
    period: 'Sep 2020 – Oct 2024',
    note: 'Second Class Upper Division · Final project: IVMS',
  },
]

const SKILLS: Record<string, string[]> = {
  'Mobile': ['Flutter', 'Dart', 'Kotlin', 'Android SDK', 'Firebase', 'Provider/Bloc/MVVM'],
  'AI & Automation': ['Autonomous Agents', 'LLM Integration', 'Prompt Engineering', 'Token Optimization', 'Serper.dev', 'TheirStack'],
  'Backend & DB': ['Python', 'Django', 'DRF', 'PostgreSQL', 'Node.js', 'Express', 'SQLite/Drift', 'Hive'],
  'Tools': ['REST APIs', 'Git', 'Docker', 'Google Maps API', 'Computer Vision API', 'CI/CD'],
}

export function Timeline() {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = ROLES[activeIdx]

  return (
    <section id="experience" className="py-24">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-sm text-[#64ffda] mb-3">03. Experience</p>
          <h2 className="font-display text-3xl font-bold text-[#ccd6f6] mb-4">
            <span className="text-[#64ffda]">Experience</span>
          </h2>
          <div className="w-16 h-px bg-[rgba(100,255,218,0.3)]" />
        </div>

        {/* Tabbed work history */}
        <div className="flex flex-col sm:flex-row gap-0">

          {/* Tab list */}
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-visible border-b sm:border-b-0 sm:border-l border-[rgba(255,255,255,0.08)] shrink-0">
            {ROLES.map((r, i) => (
              <button
                key={r.org}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "px-5 py-3 text-sm text-left whitespace-nowrap transition-all duration-150",
                  "border-b-2 sm:border-b-0 sm:border-l-2 -mb-px sm:mb-0 sm:-ml-px",
                  i === activeIdx
                    ? "border-[#64ffda] text-[#64ffda] bg-[rgba(100,255,218,0.05)] font-medium"
                    : "border-transparent text-[#8892b0] hover:text-[#ccd6f6] hover:bg-[rgba(100,255,218,0.03)]"
                )}
              >
                <span className="block font-mono text-xs text-[#4a5568] mb-0.5">{r.period}</span>
                {r.org}
                {r.current && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[rgba(100,255,218,0.1)] border border-[rgba(100,255,218,0.2)] text-[#64ffda]">
                    now
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab panel */}
          <div className="sm:pl-10 pt-6 sm:pt-0 min-h-[14rem]">
            <h3 className="font-display text-xl font-semibold text-[#ccd6f6]">
              {active.role}{' '}
              <span className="text-[#64ffda]">@ {active.org}</span>
            </h3>
            <p className="mt-1 font-mono text-xs text-[#8892b0]">{active.period}</p>
            <ul className="mt-5 space-y-3">
              {active.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-[#8892b0] text-sm">
                  <span className="text-[#64ffda] mt-0.5 shrink-0">▹</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Education */}
        <div className="mt-20">
          <h3 className="font-mono text-xs text-[#64ffda] uppercase tracking-widest mb-6">Education</h3>
          <div className="space-y-3">
            {EDUCATION.map(e => (
              <div
                key={e.title}
                className="rounded-xl px-5 py-4 bg-[#0a192f] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(100,255,218,0.2)] transition-colors flex flex-wrap items-start justify-between gap-3"
              >
                <div>
                  <div className="font-medium text-[#ccd6f6]">{e.title}</div>
                  <div className="text-sm text-[#64ffda] mt-0.5">{e.org}</div>
                  <div className="text-xs text-[#4a5568] mt-1">{e.note}</div>
                </div>
                <div className="font-mono text-xs text-[#8892b0] shrink-0">{e.period}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mt-16">
          <h3 className="font-mono text-xs text-[#64ffda] uppercase tracking-widest mb-6">Technical Skills</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(SKILLS).map(([cat, items]) => (
              <div
                key={cat}
                className="rounded-xl p-5 bg-[#0a192f] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(100,255,218,0.2)] transition-colors"
              >
                <div className="text-sm font-medium text-[#ccd6f6] mb-3">{cat}</div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map(s => (
                    <span
                      key={s}
                      className="text-xs px-2 py-1 rounded-md bg-[rgba(100,255,218,0.07)] text-[#64ffda] border border-[rgba(100,255,218,0.15)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
