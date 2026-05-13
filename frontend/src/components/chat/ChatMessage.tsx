import ReactMarkdown from 'react-markdown'
import { ChatMessage as ChatMessageType } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={['flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row'].join(' ')}>

      {/* Avatar */}
      <div className={[
        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
        isUser
          ? 'bg-primary-600 text-white'
          : 'bg-surface-3 text-text-secondary border border-border',
      ].join(' ')}>
        {isUser ? 'Y' : 'S'}
      </div>

      {/* Bubble */}
      <div className={[
        'max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
        isUser
          ? 'bg-primary-600 text-white rounded-tr-sm'
          : 'bg-surface-2 text-text-primary border border-border rounded-tl-sm',
      ].join(' ')}>

        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className={[
            'prose prose-sm max-w-none',
            'prose-p:my-1 prose-p:leading-relaxed',
            'prose-ul:my-1 prose-li:my-0.5',
            'prose-strong:font-semibold',
            'prose-code:text-xs prose-code:px-1 prose-code:rounded',
            'text-text-primary',
          ].join(' ')}>
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              /* Typing indicator while streaming */
              <div className="flex gap-1 py-1">
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            )}
          </div>
        )}

        {/* Streaming cursor */}
        {message.isStreaming && message.content && (
          <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  )
}