'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import { Sparkles, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AvailabilityStatus } from '@/types'

const SUGGESTIONS = [
  "What AI agents has Samuel built?",
  "Tell me about Stratum",
  "Walk me through his Flutter experience",
  "How can I hire him?",
]

interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface HeroProps {
  availability: AvailabilityStatus
}

export function Hero({ availability: _ }: HeroProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'visitor' | 'recruiter'>('visitor')
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null)
  const [rateLimitCode, setRateLimitCode] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef('hero-' + Math.random().toString(36).slice(2))

  const hasConversation = messages.length > 0

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming || rateLimitCode !== null) return

    const userMsg: Message = { role: 'user', content: content.trim() }
    const aiMsg: Message = { role: 'assistant', content: '', streaming: true }

    setMessages(prev => [...prev, userMsg, aiMsg])
    setInput('')
    setIsStreaming(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          mode,
          session_history: history,
          session_id: sessionId.current,
        }),
      })

      const remaining = res.headers.get('X-RateLimit-Remaining')
      if (remaining !== null) setRemainingMessages(parseInt(remaining))

      if (res.status === 429) {
        const body = await res.json().catch(() => ({}))
        const code = body.code || 'DAILY_LIMIT'
        setRateLimitCode(code)
        const limitMsg = code === 'SESSION_LIMIT'
          ? "You've used your 10 messages for this session. Your session resets in ~1 hour — or [open the full chat](/chat) for a fresh session."
          : "You've reached today's limit of 20 messages. Resets at midnight UTC — or reach Samuel at [shadivasam@gmail.com](mailto:shadivasam@gmail.com)."
        setMessages(prev =>
          prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: limitMsg, streaming: false } : m
          )
        )
        return
      }

      if (!res.ok || !res.body) throw new Error('Failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.token) {
              full += parsed.token
              setMessages(prev =>
                prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: full } : m
                )
              )
            }
          } catch { /* skip */ }
        }
      }

      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, streaming: false } : m
        )
      )
    } catch {
      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, content: "Sorry, I couldn't connect right now. Try the [full AI page](/chat).", streaming: false }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const reset = () => {
    setMessages([])
    setMode('visitor')
    setInput('')
    setRemainingMessages(null)
    setRateLimitCode(null)
  }

  return (
    <section
      id="hero"
      className="relative overflow-hidden min-h-screen flex items-center pt-16"
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[42rem] w-[42rem] rounded-full bg-[rgba(100,255,218,0.06)] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full bg-[rgba(100,255,218,0.04)] blur-[100px]" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl px-5 py-16 flex flex-col items-center">

        {/* Intro block — fades and collapses when conversation starts */}
        <div
          className={cn(
            "text-center w-full transition-all duration-700 ease-out overflow-hidden",
            hasConversation
              ? "opacity-0 -translate-y-6 max-h-0 pointer-events-none"
              : "opacity-100 translate-y-0 max-h-[50rem] mt-6",
          )}
          aria-hidden={hasConversation}
        >
          <p className="font-mono text-[#64ffda] text-sm mb-4">Hi, my name is</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-[#ccd6f6] mb-3 leading-tight">
            Samuel Shadiva.
          </h1>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-[#8892b0] mb-6 leading-tight">
            I build mobile, web, and autonomous AI systems.
          </h2>
          <p className="text-[#8892b0] text-base leading-relaxed mb-6 max-w-lg mx-auto">
            Full Stack Software &amp; AI Engineer based in Nairobi. I ship Flutter
            apps to the Play Store, architect Django/PostgreSQL backends, and design
            AI agents that actually finish the job.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-[#8892b0]">
            <Sparkles className="h-4 w-4 text-[#64ffda] shrink-0" />
            <span>Ask my AI anything — it knows my full profile.</span>
          </div>
        </div>

        {/* Conversation header — appears when chatting */}
        {hasConversation && (
          <div className="w-full flex items-center justify-between mb-3 mt-6 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-[#8892b0]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#64ffda] opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#64ffda]" />
                </span>
                <span className="font-medium text-[#ccd6f6]">Samuel&apos;s AI</span>
                <span>· grounded in his profile</span>
              </div>
              <button
                onClick={() => setMode(m => m === 'visitor' ? 'recruiter' : 'visitor')}
                className={cn(
                  "font-mono text-xs px-2.5 py-1 rounded-full border transition-all",
                  mode === 'recruiter'
                    ? "border-[rgba(100,255,218,0.4)] text-[#64ffda] bg-[rgba(100,255,218,0.08)]"
                    : "border-[rgba(255,255,255,0.1)] text-[#4a5568] hover:text-[#8892b0]"
                )}
              >
                {mode === 'recruiter' ? 'Recruiter mode' : 'Switch to recruiter'}
              </button>
            </div>
            <button
              onClick={reset}
              className="text-xs text-[#4a5568] hover:text-[#8892b0] flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> New chat
            </button>
          </div>
        )}

        {/* Messages — scrollable, fades at edges */}
        {hasConversation && (
          <div
            ref={scrollRef}
            className="w-full max-h-[55vh] overflow-y-auto space-y-4 pr-1 mb-4"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent, black 2rem, black calc(100% - 1rem), transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 2rem, black calc(100% - 1rem), transparent)',
            }}
          >
            {messages.map((m, i, arr) => (
              <MessageRow
                key={i}
                role={m.role}
                content={m.content}
                streaming={!!(isStreaming && i === arr.length - 1 && m.role === 'assistant')}
              />
            ))}
          </div>
        )}

        {/* Chat input */}
        <form
          onSubmit={handleSubmit}
          className={cn(
            "w-full border border-[rgba(255,255,255,0.08)] rounded-2xl p-2 flex items-end gap-2 bg-[#0a192f]",
            "focus-within:border-[rgba(100,255,218,0.35)] transition-all duration-200",
            !hasConversation && "mt-8",
          )}
        >
          <Sparkles className="h-4 w-4 text-[#64ffda] shrink-0 ml-2 mb-3" />
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as FormEvent)
              }
            }}
            rows={1}
            placeholder={
              hasConversation
                ? 'Ask a follow-up…'
                : 'Ask: What kind of AI agents has Samuel built?'
            }
            disabled={isStreaming || rateLimitCode !== null}
            className="flex-1 bg-transparent outline-none resize-none text-sm py-2.5 max-h-32 text-[#ccd6f6] placeholder:text-[#4a5568] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming || rateLimitCode !== null}
            aria-label="Send"
            className="h-9 w-9 shrink-0 rounded-xl bg-[#64ffda] text-[#020c1b] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>

        {/* Remaining messages count — shown after first reply */}
        {hasConversation && remainingMessages !== null && rateLimitCode === null && (
          <p className="mt-2 text-center font-mono text-xs text-[#4a5568]">
            {remainingMessages} message{remainingMessages !== 1 ? 's' : ''} left today
          </p>
        )}

        {/* Suggestion chips */}
        {!hasConversation && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                type="button"
                disabled={isStreaming}
                className="text-xs px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(10,25,47,0.4)] hover:border-[rgba(100,255,218,0.35)] hover:bg-[rgba(100,255,218,0.05)] text-[#8892b0] hover:text-[#ccd6f6] transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* CTAs */}
        {!hasConversation && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <a
              href="#work"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#64ffda] text-[#020c1b] font-medium hover:opacity-90 transition-opacity"
            >
              See Projects <ArrowDown className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.15)] text-[#8892b0] hover:border-[rgba(100,255,218,0.35)] hover:text-[#ccd6f6] transition-colors"
            >
              Get in touch
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

function MessageRow({
  role,
  content,
  streaming,
}: {
  role: 'user' | 'assistant'
  content: string
  streaming: boolean
}) {
  const isUser = role === 'user'
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-[#64ffda] text-[#020c1b] rounded-br-sm"
            : "border border-[rgba(255,255,255,0.08)] bg-[#0a192f] rounded-bl-sm",
        )}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{content}</span>
        ) : (
          <div>
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 text-[#ccd6f6] text-sm leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="text-[#ccd6f6] font-semibold">{children}</strong>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-[#64ffda] hover:underline">{children}</a>
                ),
                ul: ({ children }) => (
                  <ul className="list-none space-y-1 my-2">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="flex gap-2 text-[#ccd6f6] text-sm">
                    <span className="text-[#64ffda] flex-shrink-0 mt-0.5">·</span>
                    <span>{children}</span>
                  </li>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 my-2 text-[#ccd6f6] text-sm">{children}</ol>
                ),
                code: ({ children }) => (
                  <code className="font-mono text-xs bg-[rgba(100,255,218,0.08)] text-[#64ffda] px-1.5 py-0.5 rounded">{children}</code>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[#ccd6f6] font-semibold text-sm mt-3 mb-1">{children}</h3>
                ),
                h2: ({ children }) => (
                  <h2 className="text-[#ccd6f6] font-semibold text-base mt-4 mb-1">{children}</h2>
                ),
              }}
            >
              {content || '​'}
            </ReactMarkdown>
            {streaming && !content && (
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 bg-[#64ffda] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 bg-[#64ffda] rounded-full animate-bounce [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 bg-[#64ffda] rounded-full animate-bounce [animation-delay:240ms]" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
