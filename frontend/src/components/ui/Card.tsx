import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div className={cn(
      'bg-surface-2 border border-border rounded-xl p-6',
      hover && 'transition-all duration-200 hover:border-primary-300 hover:shadow-sm dark:hover:border-primary-700',
      className
    )}>
      {children}
    </div>
  )
}