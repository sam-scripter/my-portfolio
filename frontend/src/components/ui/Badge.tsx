import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'accent' | 'muted' | 'live' | 'progress' | 'archived'
}

export function Badge({ children, className, variant = 'muted' }: BadgeProps) {
  const styles = {
    accent:   'border border-[rgba(100,255,218,0.3)] text-[#64ffda] bg-[rgba(100,255,218,0.08)]',
    muted:    'border border-[rgba(255,255,255,0.1)] text-[#8892b0] bg-[rgba(255,255,255,0.04)]',
    live:     'border border-[rgba(100,255,218,0.3)] text-[#64ffda] bg-[rgba(100,255,218,0.08)]',
    progress: 'border border-[rgba(239,159,39,0.3)] text-[#EF9F27] bg-[rgba(239,159,39,0.08)]',
    archived: 'border border-[rgba(255,255,255,0.08)] text-[#4a5568] bg-transparent',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono',
      styles[variant],
      className
    )}>
      {children}
    </span>
  )
}