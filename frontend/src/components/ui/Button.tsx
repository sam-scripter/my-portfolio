import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children, className, variant = 'primary', size = 'md', ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
        variant === 'secondary' && 'bg-surface-2 text-text-primary border border-border hover:bg-surface-3',
        variant === 'ghost' && 'text-text-secondary hover:text-text-primary hover:bg-surface-2',
        size === 'sm' && 'px-3 py-1.5 text-sm gap-1.5',
        size === 'md' && 'px-4 py-2 text-sm gap-2',
        size === 'lg' && 'px-6 py-3 text-base gap-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}