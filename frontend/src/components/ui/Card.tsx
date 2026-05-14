import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  accent?: boolean
}

export function Card({ children, className, hover = false, accent = false }: CardProps) {
  return (
    <div className={cn(
      'rounded-xl transition-all duration-200',
      'bg-[#0a192f] border border-[rgba(255,255,255,0.08)]',
      hover && 'hover:border-[rgba(100,255,218,0.25)] hover:bg-[#112240] cursor-pointer',
      accent && 'border-[rgba(100,255,218,0.25)]',
      className
    )}>
      {children}
    </div>
  )
}