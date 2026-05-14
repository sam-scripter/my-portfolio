'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  onOpenChat?: () => void
}

const NAV_LINKS = [
  { href: '#work',       label: '01. Work' },
  { href: '#skills',     label: '02. Skills' },
  { href: '#experience', label: '03. Experience' },
  { href: '#contact',    label: '04. Contact' },
]

// Social icon SVGs
function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}

export function Navbar({ onOpenChat }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Left sidebar — social icons (desktop only) */}
      <div className="hidden lg:flex fixed left-8 bottom-0 z-50 flex-col items-center gap-5 after:content-[''] after:w-px after:h-24 after:bg-[#8892b0]">
        <a href="https://github.com/Sam-scripter" target="_blank" rel="noopener noreferrer"
          className="text-[#8892b0] hover:text-[#64ffda] hover:-translate-y-1 transition-all duration-200">
          <GithubIcon />
        </a>
        <a href="https://linkedin.com/in/samuelshadiva" target="_blank" rel="noopener noreferrer"
          className="text-[#8892b0] hover:text-[#64ffda] hover:-translate-y-1 transition-all duration-200">
          <LinkedinIcon />
        </a>
        <a href="mailto:shadivasam@gmail.com"
          className="text-[#8892b0] hover:text-[#64ffda] hover:-translate-y-1 transition-all duration-200">
          <MailIcon />
        </a>
      </div>

      {/* Right sidebar — email vertical text (desktop only) */}
      <div className="hidden lg:flex fixed right-8 bottom-0 z-50 flex-col items-center gap-5 after:content-[''] after:w-px after:h-24 after:bg-[#8892b0]">
        <a
          href="mailto:shadivasam@gmail.com"
          className="font-mono text-xs text-[#8892b0] hover:text-[#64ffda] transition-colors duration-200 tracking-widest"
          style={{ writingMode: 'vertical-rl' }}
        >
          shadivasam@gmail.com
        </a>
      </div>

      {/* Top navbar */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-6 lg:px-24',
        scrolled ? 'bg-[rgba(2,12,27,0.9)] backdrop-blur-md' : 'bg-transparent'
      )}>
        <nav className="max-w-6xl mx-auto h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="font-mono text-[#64ffda] text-sm font-medium hover:opacity-80 transition-opacity">
            S.
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-xs text-[#8892b0] hover:text-[#64ffda] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/chat"
              className="font-mono text-xs text-[#64ffda] border border-[rgba(100,255,218,0.3)] px-4 py-2 rounded hover:bg-[rgba(100,255,218,0.08)] transition-all duration-200"
            >
              AI Assistant
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#ccd6f6] p-2"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0a192f] border-t border-[rgba(255,255,255,0.08)] px-6 py-6 flex flex-col gap-5">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-mono text-sm text-[#8892b0] hover:text-[#64ffda] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/chat"
              onClick={() => setMenuOpen(false)}
              className="font-mono text-sm text-[#64ffda] border border-[rgba(100,255,218,0.3)] px-4 py-2 rounded text-center hover:bg-[rgba(100,255,218,0.08)] transition-all"
            >
              AI Assistant
            </Link>
            <div className="flex gap-5 pt-2">
              <a href="https://github.com/Sam-scripter" target="_blank" rel="noopener noreferrer" className="text-[#8892b0] hover:text-[#64ffda] transition-colors"><GithubIcon /></a>
              <a href="https://linkedin.com/in/samuelshadiva" target="_blank" rel="noopener noreferrer" className="text-[#8892b0] hover:text-[#64ffda] transition-colors"><LinkedinIcon /></a>
              <a href="mailto:shadivasam@gmail.com" className="text-[#8892b0] hover:text-[#64ffda] transition-colors"><MailIcon /></a>
            </div>
          </div>
        )}
      </header>
    </>
  )
}