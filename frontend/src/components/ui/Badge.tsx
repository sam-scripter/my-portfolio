import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variant === 'default' && 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
      variant === 'outline' && 'border border-border text-text-secondary',
      className
    )}>
      {children}
    </span>
  )
}