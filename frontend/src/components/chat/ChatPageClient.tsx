'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useChat } from '@/hooks/useChat'
import { FitReport } from './FitReport'
import { Project, SkillsByCategory } from '@/types'

interface ChatPageClientProps {
  projects: Project[]
  skills: SkillsByCategory
}

const PROMPT_STARTERS = [
  { label: 'What has Samuel built?',   message: 'What projects has Samuel built?' },
  { label: 'Why hire Samuel?',         message: 'Why should I hire Samuel?' },
  { label: 'Show AI projects',         message: 'What AI projects has Samuel built?' },
  { label: 'His engineering approach', message: 'How does Samuel approach software development?' },
]

function AIAvatar() {
  return (
    <div className="w-8 h-8 rounded-lg bg-[rgba(100,255,218,0.1)] border border-[rgba(100,255,218,0.2)] flex items-center justify-center flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="1.75" strokeLinecap="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <circle cx="12" cy="16" r="1" fill="#64ffda"/>
      </svg>
    </div>
  )
}

export function ChatPageClient({ projects, skills }: ChatPageClientProps) {
  const {
    messages, mode, isStreaming, remainingMessages,
    rateLimitHit, rateLimitCode, fitReport, analyzingFit,
    sendMessage, runFitAnalysis, clearMessages, switchMode,
  } = useChat()

  const [inputValue, setInputValue] = useState('')
  const [jdInput, setJdInput] = useState('')
  const [jdSubmitted, setJdSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = (msg?: string) => {
    const content = msg || inputValue
    if (!content.trim() || isStreaming) return
    sendMessage(content)
    setInputValue('')
  }

  const handleJDSubmit = () => {
    if (!jdInput.trim()) return
    setJdSubmitted(true)
    runFitAnalysis(jdInput.trim())
  }

  const handleModeSwitch = (newMode: 'visitor' | 'recruiter') => {
    switchMode(newMode)
  }

  const handleClearAll = () => {
    clearMessages()
    setJdSubmitted(false)
    setJdInput('')
  }

  // Only show messages that belong to the current mode
  const filteredMessages = messages.filter(m => !m.mode || m.mode === mode)

  return (
    // Full viewport height, no overflow — everything contained
    <div
      className="flex flex-col"
      style={{ height: '100vh', background: '#020c1b', overflow: 'hidden' }}
    >
      {/* ── Top nav ─────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 border-b"
        style={{
          height: '56px',
          background: 'rgba(2,12,27,0.9)',
          borderColor: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link href="/" className="font-mono text-sm font-semibold" style={{ color: '#64ffda' }}>
          shadivah
        </Link>
        <div className="flex items-center gap-6">
          {[
            { label: '01. About', href: '/#about' },
            { label: '02. Projects', href: '/#work' },
            { label: '03. Experience', href: '/#experience' },
            { label: '04. Contact', href: '/#contact' },
          ].map(l => (
            <Link key={l.label} href={l.href}
              className="font-mono text-xs hidden md:block transition-colors"
              style={{ color: '#8892b0' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#64ffda')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8892b0')}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="/resume.pdf"
            download="Samuel_Shadiva_Resume.pdf"
            className="font-mono text-xs px-3 py-1.5 rounded border transition-all"
            style={{ color: '#64ffda', borderColor: 'rgba(100,255,218,0.3)', background: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(100,255,218,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Resume
          </a>
        </div>
      </header>

      {/* ── Two-panel body ──────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 px-6 py-4">
        <div className="max-w-6xl mx-auto w-full flex gap-5 min-h-0">

        {/* ── LEFT: Chat panel ────────────────────────────── */}
        <div
          className="flex flex-col flex-1 min-w-0 rounded-xl border overflow-hidden"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#0a192f' }}
        >

          {/* Chat subheader */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,25,47,0.4)' }}
          >
            <div className="flex items-center gap-3">
              <AIAvatar />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#ccd6f6' }}>
                  Samuel&apos;s AI Assistant
                </p>
                <p className="font-mono text-xs flex items-center gap-1.5" style={{ color: '#64ffda' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#64ffda' }} />
                  online · RAG powered
                </p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg border"
              style={{ background: '#0a192f', borderColor: 'rgba(255,255,255,0.08)' }}>
              {(['visitor', 'recruiter'] as const).map(m => (
                <button key={m} onClick={() => handleModeSwitch(m)}
                  className="font-mono text-xs px-3 py-1.5 rounded capitalize transition-all"
                  style={mode === m
                    ? { background: 'rgba(100,255,218,0.1)', color: '#64ffda', border: '0.5px solid rgba(100,255,218,0.35)' }
                    : { color: '#8892b0', border: '0.5px solid transparent' }
                  }
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* ── Scrollable messages area ── */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5" style={{ minHeight: 0 }}>

            {/* Rate limit warning */}
            {rateLimitHit && (
              <div className="rounded-xl p-5 border"
                style={{ background: 'rgba(239,159,39,0.05)', borderColor: 'rgba(239,159,39,0.25)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: '#EF9F27' }}>
                  {rateLimitCode === 'SESSION_LIMIT' ? 'Session limit reached' : 'Daily limit reached'}
                </p>
                <p className="text-xs mb-3" style={{ color: '#8892b0' }}>
                  {rateLimitCode === 'SESSION_LIMIT'
                    ? 'You\'ve used your 10 messages for this session. Your session resets in ~1 hour — or start a new browser tab for a fresh session. You have up to 20 messages total per day.'
                    : 'You\'ve reached today\'s limit of 20 messages. Resets at midnight UTC — or reach Samuel directly.'}
                </p>
                <a href="mailto:shadivasam@gmail.com" className="font-mono text-xs" style={{ color: '#64ffda' }}>
                  shadivasam@gmail.com →
                </a>
              </div>
            )}

            {/* Recruiter — JD input */}
            {mode === 'recruiter' && !jdSubmitted && (
              <div className="rounded-xl p-6 border"
                style={{ background: '#0a192f', borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="font-mono text-xs mb-1" style={{ color: '#64ffda' }}>Recruiter mode</p>
                <p className="text-sm font-semibold mb-1" style={{ color: '#ccd6f6' }}>Paste a job description</p>
                <p className="text-xs mb-4" style={{ color: '#8892b0' }}>
                  I&apos;ll analyse how Samuel matches each requirement with evidence from his actual experience.
                </p>
                <textarea
                  value={jdInput}
                  onChange={e => setJdInput(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={7}
                  className="w-full font-mono text-xs resize-none outline-none rounded-lg px-4 py-3 transition-colors"
                  style={{
                    background: '#112240', color: '#ccd6f6',
                    border: '0.5px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(100,255,218,0.3)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <button
                  onClick={handleJDSubmit}
                  disabled={!jdInput.trim() || analyzingFit}
                  className="w-full mt-3 font-mono text-sm py-2.5 rounded transition-all"
                  style={{
                    color: '#64ffda',
                    border: '0.5px solid rgba(100,255,218,0.3)',
                    background: 'transparent',
                    opacity: (!jdInput.trim() || analyzingFit) ? 0.4 : 1,
                    cursor: (!jdInput.trim() || analyzingFit) ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => { if (jdInput.trim() && !analyzingFit) (e.currentTarget.style.background = 'rgba(100,255,218,0.06)') }}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {analyzingFit ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3 h-3 rounded-full border animate-spin"
                        style={{ borderColor: '#64ffda', borderTopColor: 'transparent' }} />
                      Analysing...
                    </span>
                  ) : 'Analyse fit →'}
                </button>
              </div>
            )}

            {/* Recruiter — analysing */}
            {mode === 'recruiter' && jdSubmitted && analyzingFit && (
              <div className="flex items-start gap-3">
                <AIAvatar />
                <div
                  className="flex-1 rounded-2xl rounded-tl-sm px-5 py-4 border"
                  style={{ background: '#0a192f', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: '#ccd6f6' }}>
                    Running fit analysis
                  </p>
                  <p className="text-xs mb-3" style={{ color: '#8892b0' }}>
                    Cross-referencing Samuel&apos;s experience against your requirements...
                  </p>
                  <div className="space-y-2">
                    {[
                      'Parsing job requirements',
                      'Matching skills & experience',
                      'Generating fit report',
                    ].map((step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-bounce flex-shrink-0"
                          style={{ background: '#64ffda', animationDelay: `${i * 150}ms` }}
                        />
                        <span className="font-mono text-xs" style={{ color: '#4a5568' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Fit report */}
            {mode === 'recruiter' && jdSubmitted && fitReport && (
              <div>
                <FitReport report={fitReport} />
                <button
                  onClick={() => { setJdSubmitted(false); setJdInput('') }}
                  className="mt-3 font-mono text-xs transition-colors"
                  style={{ color: '#4a5568' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#8892b0')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#4a5568')}
                >
                  ← change job description
                </button>
              </div>
            )}

            {/* Initial greeting + prompt starters */}
            {filteredMessages.length === 0 && !rateLimitHit &&
             !(mode === 'recruiter' && (!jdSubmitted || analyzingFit)) && (
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <AIAvatar />
                  <div
                    className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: '#0a192f',
                      border: '0.5px solid rgba(255,255,255,0.08)',
                      color: '#ccd6f6',
                    }}
                  >
                    {mode === 'visitor'
                      ? "Hey! I'm Samuel's AI assistant. Ask me anything about his work, projects, or engineering background. What would you like to know?"
                      : "You've submitted a job description. Feel free to ask follow-up questions about Samuel's fit."}
                  </div>
                </div>

                {/* Prompt starters */}
                <div className="pl-11 grid grid-cols-2 gap-2">
                  {PROMPT_STARTERS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.message)}
                      className="text-left font-mono text-xs px-3 py-2.5 rounded-lg border transition-all"
                      style={{ color: '#8892b0', borderColor: 'rgba(255,255,255,0.08)' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(100,255,218,0.3)'
                        e.currentTarget.style.color = '#64ffda'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.color = '#8892b0'
                      }}
                    >
                      ▹ {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation messages */}
            {filteredMessages.map((msg, i) => (
              <div key={i}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div
                      className="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%] text-sm"
                      style={{
                        background: 'rgba(100,255,218,0.08)',
                        border: '0.5px solid rgba(100,255,218,0.15)',
                        color: '#64ffda',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <AIAvatar />
                    <div
                      className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3"
                      style={{
                        background: '#0a192f',
                        border: '0.5px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {msg.content ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0 text-sm leading-relaxed" style={{ color: '#ccd6f6' }}>{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold" style={{ color: '#ccd6f6' }}>{children}</strong>
                            ),
                            a: ({ href, children }) => (
                              <a href={href} className="hover:underline" style={{ color: '#64ffda' }}>{children}</a>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-none space-y-1.5 my-2">{children}</ul>
                            ),
                            li: ({ children }) => (
                              <li className="flex gap-2 text-sm" style={{ color: '#ccd6f6' }}>
                                <span className="flex-shrink-0" style={{ color: '#64ffda' }}>▹</span>
                                <span>{children}</span>
                              </li>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside space-y-1 my-2 text-sm" style={{ color: '#ccd6f6' }}>{children}</ol>
                            ),
                            code: ({ children }) => (
                              <code
                                className="font-mono text-xs px-1.5 py-0.5 rounded"
                                style={{ background: 'rgba(100,255,218,0.08)', color: '#64ffda' }}
                              >{children}</code>
                            ),
                            h3: ({ children }) => (
                              <h3 className="font-semibold mt-3 mb-1" style={{ color: '#ccd6f6' }}>{children}</h3>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="flex gap-1 py-1">
                          {[0, 150, 300].map(delay => (
                            <span
                              key={delay}
                              className="w-1.5 h-1.5 rounded-full animate-bounce"
                              style={{
                                background: '#4a5568',
                                animationDelay: `${delay}ms`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                      {msg.isStreaming && msg.content && (
                        <span
                          className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle"
                          style={{ background: '#64ffda' }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* ── Input bar — fixed at bottom of left panel ── */}
          {!rateLimitHit && !(mode === 'recruiter' && !jdSubmitted) && (
            <div
              className="flex-shrink-0 px-6 py-4 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors"
                style={{
                  background: '#0a192f',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
                onFocus={() => {}}
              >
                <span className="font-mono text-sm flex-shrink-0" style={{ color: '#64ffda' }}>
                  &gt;_
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder={
                    mode === 'recruiter'
                      ? 'Ask a follow-up question...'
                      : 'Ask me anything about Samuel...'
                  }
                  maxLength={500}
                  disabled={isStreaming}
                  className="flex-1 bg-transparent font-mono text-sm outline-none"
                  style={{ color: '#ccd6f6' }}
                />
                {remainingMessages !== null && (
                  <span className="font-mono text-xs flex-shrink-0" style={{ color: '#4a5568' }}>
                    {remainingMessages} left
                  </span>
                )}
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isStreaming}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: 'rgba(100,255,218,0.1)',
                    border: '0.5px solid rgba(100,255,218,0.25)',
                    color: '#64ffda',
                    opacity: (!inputValue.trim() || isStreaming) ? 0.3 : 1,
                    cursor: (!inputValue.trim() || isStreaming) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sidebar ───────────────────────────────── */}
        <div
          className="hidden lg:flex flex-col flex-shrink-0 overflow-y-auto rounded-xl border"
          style={{
            width: '280px',
            background: '#0a192f',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          {/* Resume download */}
          <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <a
              href="/resume.pdf"
              download="Samuel_Shadiva_Resume.pdf"
              className="flex items-center gap-3 p-3 rounded-lg border transition-all group"
              style={{
                background: 'rgba(100,255,218,0.04)',
                borderColor: 'rgba(100,255,218,0.2)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(100,255,218,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(100,255,218,0.04)')}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(100,255,218,0.1)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64ffda" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold transition-colors"
                  style={{ color: '#ccd6f6' }}>
                  Download Resume
                </p>
                <p className="font-mono text-xs" style={{ color: '#4a5568' }}>PDF · 2026</p>
              </div>
            </a>
          </div>

          {/* Core skills */}
          <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="font-mono text-xs uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              Core skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Flutter', 'Python', 'LLMs', 'FastAPI', 'Node.js', 'Django', 'Docker', 'pgvector', 'PostgreSQL', 'React.js'].map(s => (
                <span
                  key={s}
                  className="font-mono text-xs px-2 py-0.5 rounded border"
                  style={{
                    background: 'rgba(100,255,218,0.06)',
                    borderColor: 'rgba(100,255,218,0.12)',
                    color: 'rgba(100,255,218,0.7)',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-xs uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.25)' }}>
                Projects
              </p>
              <Link href="/#work" className="font-mono text-xs" style={{ color: '#64ffda' }}>
                &lt;/&gt;
              </Link>
            </div>
            <div className="space-y-2.5">
              {projects.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={'/projects/' + p.slug}
                    className="text-xs truncate flex-1 transition-colors"
                    style={{ color: '#8892b0' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ccd6f6')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#8892b0')}
                  >
                    {p.title}
                  </Link>
                  <span
                    className="font-mono text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                    style={p.status === 'live'
                      ? { background: 'rgba(100,255,218,0.08)', color: '#64ffda' }
                      : { background: 'rgba(239,159,39,0.08)', color: '#EF9F27' }
                    }
                  >
                    {p.status === 'live' ? 'Live' : 'WIP'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="font-mono text-xs uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              Contact
            </p>
            <div className="space-y-2">
              <a href="mailto:shadivasam@gmail.com"
                className="flex items-center gap-2 text-xs transition-colors"
                style={{ color: '#8892b0' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#64ffda')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8892b0')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                shadivasam@gmail.com
              </a>
              <a href="https://linkedin.com/in/samuelshadiva" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs transition-colors"
                style={{ color: '#8892b0' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#64ffda')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8892b0')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                samuelshadiva
              </a>
            </div>
          </div>

          {/* Clear chat — bottom */}
          <div className="p-5 mt-auto">
            <button
              onClick={handleClearAll}
              className="w-full font-mono text-xs py-2 rounded border text-center transition-all"
              style={{ color: '#4a5568', borderColor: 'rgba(255,255,255,0.06)' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#8892b0'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#4a5568'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              }}
            >
              Clear conversation
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}