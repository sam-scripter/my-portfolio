'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, allow Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    // Auto-resize up to 120px
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const charCount = value.length
  const overLimit = charCount > 500

  return (
    <div className="border-t border-border p-3">
      <div className={[
        'flex gap-2 items-end rounded-xl border bg-surface transition-colors',
        overLimit ? 'border-red-400' : 'border-border focus-within:border-primary-400',
      ].join(' ')}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder || 'Ask me anything about Samuel...'}
          disabled={disabled}
          rows={1}
          maxLength={520}
          className="flex-1 resize-none bg-transparent text-sm text-text-primary placeholder:text-text-muted px-3 py-2.5 outline-none min-h-[40px] max-h-[120px] disabled:opacity-50"
        />
        <div className="flex items-end gap-1.5 pr-2 pb-2">
          {charCount > 400 && (
            <span className={['text-xs', overLimit ? 'text-red-400' : 'text-text-muted'].join(' ')}>
              {500 - charCount}
            </span>
          )}
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim() || overLimit}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}