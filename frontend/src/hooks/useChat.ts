'use client'

import { useState, useRef, useCallback } from 'react'
import { ChatMessage, ChatMode, FitReport } from '@/types'
import { analyzeFit } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Generate a simple unique ID for messages
const uid = () => Math.random().toString(36).slice(2)

// Session ID — persists for the browser session
// Each new tab/window gets a fresh session
const SESSION_ID = uid()

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [mode, setMode] = useState<ChatMode>('visitor')
  const [isStreaming, setIsStreaming] = useState(false)
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null)
  const [rateLimitCode, setRateLimitCode] = useState<string | null>(null)
  const [fitReport, setFitReport] = useState<FitReport | null>(null)
  const [analyzingFit, setAnalyzingFit] = useState(false)

  // Ref to track the current streaming message ID
  // so we can append tokens to the right message
  const streamingIdRef = useRef<string | null>(null)

  const sendMessage = useCallback(async (content: string, jobDescription?: string) => {
    if (isStreaming || rateLimitCode !== null) return
    if (!content.trim()) return

    // Add the user message immediately (optimistic UI)
    const userMessage: ChatMessage = {
      id: uid(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    // Create an empty AI message that will be filled as tokens stream in
    const aiMessageId = uid()
    streamingIdRef.current = aiMessageId

    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages(prev => [...prev, userMessage, aiMessage])
    setIsStreaming(true)

    try {
      // Build session history from current messages
      // Send the last 6 pairs (12 messages) for context
      const history = messages.slice(-12).map(m => ({
        role: m.role,
        content: m.content,
      }))

      // Open a fetch stream to the Fastify API
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          mode,
          session_history: history,
          session_id: SESSION_ID,
          job_description: jobDescription || null,
        }),
      })

      // Read rate limit headers
      const remaining = response.headers.get('X-RateLimit-Remaining')
      if (remaining !== null) {
        setRemainingMessages(parseInt(remaining))
      }

      // Handle rate limit response
      if (response.status === 429) {
        const body = await response.json().catch(() => ({}))
        setRateLimitCode(body.code || 'DAILY_LIMIT')
        setIsStreaming(false)
        setMessages(prev => prev.filter(m => m.id !== aiMessageId))
        return
      }

      if (!response.ok || !response.body) {
        throw new Error('Stream failed')
      }

      // Read the SSE stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the chunk and split into SSE events
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)

            if (parsed.token) {
              fullContent += parsed.token
              // Append each token to the streaming message
              setMessages(prev =>
                prev.map(m =>
                  m.id === aiMessageId
                    ? { ...m, content: fullContent }
                    : m
                )
              )
            }

            if (parsed.error) {
              fullContent = parsed.error
              setMessages(prev =>
                prev.map(m =>
                  m.id === aiMessageId
                    ? { ...m, content: fullContent }
                    : m
                )
              )
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      // Mark streaming as complete
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMessageId
            ? { ...m, isStreaming: false }
            : m
        )
      )
    } catch (err) {
      // On error, show a friendly message
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMessageId
            ? {
                ...m,
                content: 'Something went wrong. Please try again.',
                isStreaming: false,
              }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
      streamingIdRef.current = null
    }
  }, [isStreaming, rateLimitCode, messages, mode])

  const runFitAnalysis = useCallback(async (jobDescription: string) => {
    setAnalyzingFit(true)
    setFitReport(null)
    try {
      const report = await analyzeFit(jobDescription)
      setFitReport(report)
    } catch {
      // Show error in chat
      const errorMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: 'Fit analysis failed. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setAnalyzingFit(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setFitReport(null)
    setRateLimitCode(null)
  }, [])

  const switchMode = useCallback((newMode: ChatMode) => {
    setMode(newMode)
    setFitReport(null)
    // Don't clear messages — context carries over
  }, [])

  return {
    messages,
    mode,
    isStreaming,
    remainingMessages,
    rateLimitHit: rateLimitCode !== null,
    rateLimitCode,
    fitReport,
    analyzingFit,
    sendMessage,
    runFitAnalysis,
    clearMessages,
    switchMode,
    setMode,
  }
}