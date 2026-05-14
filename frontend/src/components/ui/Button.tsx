import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children, className, variant = 'primary', size = 'md', ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-mono rounded transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed gap-2',
        variant === 'primary' && [
          'bg-[rgba(100,255,218,0.1)] text-[#64ffda]',
          'border border-[rgba(100,255,218,0.3)]',
          'hover:bg-[rgba(100,255,218,0.18)] hover:border-[rgba(100,255,218,0.5)]',
          'active:scale-95',
        ],
        variant === 'outline' && [
          'bg-transparent text-[#ccd6f6]',
          'border border-[rgba(255,255,255,0.15)]',
          'hover:border-[rgba(100,255,218,0.4)] hover:text-[#64ffda]',
          'active:scale-95',
        ],
        variant === 'ghost' && [
          'bg-transparent text-[#8892b0]',
          'border border-transparent',
          'hover:text-[#ccd6f6] hover:border-[rgba(255,255,255,0.1)]',
        ],
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-sm',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}