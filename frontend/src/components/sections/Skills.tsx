import { SkillsByCategory } from '@/types'

interface SkillsProps {
  skills: SkillsByCategory
}

const CATEGORY_ORDER = [
  'Mobile',
  'AI & Automation',
  'Backend',
  'Frontend',
  'Tools & DevOps',
]

const PROFICIENCY_LABEL: Record<number, string> = {
  5: 'Expert',
  4: 'Proficient',
  3: 'Working knowledge',
  2: 'Foundational',
  1: 'Exploring',
}

export function Skills({ skills }: SkillsProps) {
  const ordered = CATEGORY_ORDER.filter(c => skills[c])

  return (
    <section id="skills" className="py-24 px-6 lg:px-24 bg-[#0a192f]">
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <div className="mb-12">
          <p className="font-mono text-sm text-[#64ffda] mb-3">02. Skills</p>
          <h2 className="text-3xl font-bold text-[#ccd6f6] mb-4">
            Technical Toolkit
          </h2>
          <div className="w-16 h-px bg-[rgba(100,255,218,0.3)]" />
        </div>

        <div className="space-y-12">
          {ordered.map(category => (
            <div key={category}>
              {/* Category label */}
              <p className="font-mono text-xs text-[#64ffda] uppercase tracking-widest mb-5">
                {category}
              </p>

              {/* Skills grid */}
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-4">
                {skills[category].map(skill => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[#ccd6f6]">{skill.name}</span>
                      <span className="font-mono text-xs text-[#4a5568]">
                        {PROFICIENCY_LABEL[skill.proficiency] || ''}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-px bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[rgba(100,255,218,0.5)] rounded-full transition-all duration-700"
                        style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.06)] flex flex-wrap gap-6">
          {[5, 4, 3, 2].map(level => (
            <div key={level} className="flex items-center gap-2">
              <div className="w-8 h-px bg-[rgba(100,255,218,0.5)]" style={{ opacity: level / 5 }} />
              <span className="font-mono text-xs text-[#4a5568]">
                {PROFICIENCY_LABEL[level]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}