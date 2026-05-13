import { SkillsByCategory } from '@/types'
import { SectionHeader } from '../ui/SectionHeader'

interface SkillsProps {
  skills: SkillsByCategory
}

// Category display order
const CATEGORY_ORDER = ['Mobile', 'AI & Automation', 'Backend', 'Frontend', 'Tools & DevOps']

export function Skills({ skills }: SkillsProps) {
  const orderedCategories = CATEGORY_ORDER.filter(c => skills[c])

  return (
    <section id="skills" className="py-24 bg-surface-2">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          title="Technical Skills"
          subtitle="Tools and technologies I work with regularly — proficiency shown honestly."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orderedCategories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
                {category}
              </h3>
              <div className="flex flex-col gap-3">
                {skills[category].map(skill => (
                  <SkillRow key={skill.name} skill={skill} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Proficiency legend */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-6 text-xs text-text-muted">
          <span className="font-medium text-text-secondary">Proficiency:</span>
          {[
            { dots: 5, label: 'Expert' },
            { dots: 4, label: 'Proficient' },
            { dots: 3, label: 'Working knowledge' },
            { dots: 2, label: 'Foundational' },
          ].map(({ dots, label }) => (
            <span key={label} className="flex items-center gap-2">
              <Dots filled={dots} total={5} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillRow({ skill }: { skill: { name: string; proficiency: number } }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-primary">{skill.name}</span>
      <Dots filled={skill.proficiency} total={5} />
    </div>
  )
}

function Dots({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full transition-colors ${
            i < filled
              ? 'bg-primary-500'
              : 'bg-surface-3 dark:bg-gray-700'
          }`}
        />
      ))}
    </div>
  )
}