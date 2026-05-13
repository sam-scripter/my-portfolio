'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, RotateCcw, Mail } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { PromptStarters } from './PromptStarters'
import { FitReport } from './FitReport'
import { ChatMode } from '@/types'

interface ChatWidgetProps {
  open: boolean
  onClose: () => void
}

export function ChatWidget({ open, onClose }: ChatWidgetProps) {
  const {
    messages,
    mode,
    isStreaming,
    remainingMessages,
    rateLimitHit,
    fitReport,
    analyzingFit,
    sendMessage,
    runFitAnalysis,
    clearMessages,
    switchMode,
  } = useChat()

  const [jdInput, setJdInput] = useState('')
  const [jdSubmitted, setJdSubmitted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleModeSwitch = (newMode: ChatMode) => {
    switchMode(newMode)
    if (newMode === 'visitor') {
      setJdSubmitted(false)
      setJdInput('')
    }
  }

  const handleJDSubmit = () => {
    if (!jdInput.trim()) return
    setJdSubmitted(true)
    runFitAnalysis(jdInput.trim())
  }

  const handleReset = () => {
    clearMessages()
    setJdSubmitted(false)
    setJdInput('')
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Widget panel */}
      <div className={[
        'fixed z-50 flex flex-col',
        'bottom-0 right-0 w-full h-[85vh]',
        'md:bottom-6 md:right-6 md:w-[400px] md:h-[600px] md:rounded-2xl',
        'bg-surface border border-border shadow-2xl',
        'transition-all duration-300',
      ].join(' ')}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <MessageSquare size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Samuel&apos;s AI</p>
              <p className="text-xs text-text-muted">Ask me anything professional</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Remaining messages counter */}
            {remainingMessages !== null && (
              <span className="text-xs text-text-muted px-2 py-1 bg-surface-2 rounded-full">
                {remainingMessages} left
              </span>
            )}
            <button
              onClick={handleReset}
              className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-2 transition-all"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-2 transition-all"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex px-4 py-2.5 gap-2 border-b border-border flex-shrink-0">
          {(['visitor', 'recruiter'] as ChatMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeSwitch(m)}
              className={[
                'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
                mode === m
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3',
              ].join(' ')}
            >
              {m === 'visitor' ? 'Visitor' : 'Recruiter'}
            </button>
          ))}
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* Rate limit hit */}
          {rateLimitHit && (
            <div className="m-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                Daily limit reached
              </p>
              <p className="text-amber-700 dark:text-amber-400 text-xs mb-3">
                You&apos;ve used today&apos;s 20 messages. Come back tomorrow or contact Samuel directly.
              </p>
              <a
                href="mailto:shadivasam@gmail.com"
                className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-medium hover:underline"
              >
                <Mail size={12} />
                shadivasam@gmail.com
              </a>
            </div>
          )}

          {/* Recruiter mode — JD input */}
          {mode === 'recruiter' && !jdSubmitted && (
            <div className="p-4">
              <p className="text-sm font-medium text-text-primary mb-1">Paste a job description</p>
              <p className="text-xs text-text-muted mb-3">
                I&apos;ll analyse how Samuel matches the requirements with specific evidence.
              </p>
              <textarea
                value={jdInput}
                onChange={e => setJdInput(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={6}
                className="w-full text-xs text-text-primary placeholder:text-text-muted bg-surface-2 border border-border rounded-lg px-3 py-2.5 resize-none outline-none focus:border-primary-400 transition-colors"
              />
              <button
                onClick={handleJDSubmit}
                disabled={!jdInput.trim() || analyzingFit}
                className="w-full mt-2 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {analyzingFit ? 'Analysing...' : 'Analyse fit'}
              </button>
            </div>
          )}

          {/* Recruiter fit report */}
          {mode === 'recruiter' && jdSubmitted && fitReport && (
            <div className="p-4">
              <FitReport report={fitReport} />
              <button
                onClick={() => { setJdSubmitted(false); setJdInput('') }}
                className="mt-2 text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                ← Change job description
              </button>
              <p className="text-xs text-text-muted mt-3 mb-1">Ask a follow-up question:</p>
            </div>
          )}

          {/* Recruiter loading state */}
          {mode === 'recruiter' && jdSubmitted && analyzingFit && (
            <div className="p-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-text-muted">
                <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                Analysing fit...
              </div>
            </div>
          )}

          {/* Prompt starters — shown when no messages yet */}
          {messages.length === 0 && !rateLimitHit &&
           !(mode === 'recruiter' && !jdSubmitted) && (
            <div>
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs text-text-muted leading-relaxed">
                  {mode === 'visitor'
                    ? "Hi! I'm Samuel's AI assistant. Ask me anything about his professional background, skills, or projects."
                    : "You've submitted the job description. Ask me follow-up questions about Samuel's fit."}
                </p>
              </div>
              <PromptStarters mode={mode} onSelect={(p) => sendMessage(p)} />
            </div>
          )}

          {/* Message list */}
          {messages.length > 0 && (
            <div className="px-4 py-3 space-y-4">
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input — only show when appropriate */}
        {!rateLimitHit && !(mode === 'recruiter' && !jdSubmitted) && (
          <ChatInput
            onSend={sendMessage}
            disabled={isStreaming}
            placeholder={
              mode === 'recruiter'
                ? 'Ask a follow-up question...'
                : 'Ask me anything about Samuel...'
            }
          />
        )}
      </div>
    </>
  )
}