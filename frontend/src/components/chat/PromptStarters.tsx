import { ChatMode } from '@/types'

interface PromptStartersProps {
  mode: ChatMode
  onSelect: (prompt: string) => void
}

const VISITOR_STARTERS = [
  "What are Samuel's strongest technical skills?",
  "Tell me about the Stratum app",
  "What AI projects has he built?",
  "What kind of roles is he looking for?",
]

const RECRUITER_STARTERS = [
  "Summarise how he fits this role",
  "What is his strongest relevant project?",
  "Does he have any gaps for this position?",
  "What questions should I ask him?",
]

export function PromptStarters({ mode, onSelect }: PromptStartersProps) {
  const starters = mode === 'recruiter' ? RECRUITER_STARTERS : VISITOR_STARTERS

  return (
    <div className="px-4 py-3">
      <p className="text-xs text-text-muted mb-2.5">Try asking:</p>
      <div className="grid grid-cols-1 gap-1.5">
        {starters.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="text-left text-xs px-3 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border hover:border-primary-300 text-text-secondary hover:text-text-primary transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}