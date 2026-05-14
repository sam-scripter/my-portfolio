interface SectionHeaderProps {
  label: string      // small monospace label above e.g. "01. Work"
  title: string
  subtitle?: string
}

export function SectionHeader({ label, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-16">
      <p className="font-mono text-sm text-[#64ffda] mb-3">{label}</p>
      <h2 className="text-3xl font-bold text-[#ccd6f6] mb-4">{title}</h2>
      {subtitle && (
        <p className="text-[#8892b0] max-w-xl leading-relaxed">{subtitle}</p>
      )}
      <div className="mt-6 w-16 h-px bg-[rgba(100,255,218,0.3)]" />
    </div>
  )
}