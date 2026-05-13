import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Combines class names and merges Tailwind conflicts cleanly
// Usage: cn('px-4 py-2', isActive && 'bg-blue-500', className)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a date string to "May 2026" or "3 days ago"
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// Status label and color for project badges
export function getStatusConfig(status: string) {
  switch (status) {
    case 'live':
      return { label: 'Live', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
    case 'in_progress':
      return { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
    default:
      return { label: 'Archived', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
  }
}

// Language color mapping for GitHub language badges
export function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    'Dart': '#00B4AB',
    'Python': '#3572A5',
    'TypeScript': '#2b7489',
    'JavaScript': '#f1e05a',
    'Kotlin': '#A97BFF',
  }
  return colors[language || ''] || '#6e7681'
}