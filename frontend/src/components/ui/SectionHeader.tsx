interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-text-primary mb-3">{title}</h2>
      {subtitle && (
        <p className="text-text-secondary max-w-2xl">{subtitle}</p>
      )}
      <div className="mt-4 w-12 h-1 bg-primary-500 rounded-full" />
    </div>
  )
}