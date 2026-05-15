import Image from 'next/image'

const HIGHLIGHTS = [
  {
    stat: '2',
    title: 'Apps on Google Play',
    body: 'Stratum and Number Your Days — both shipped end-to-end.',
  },
  {
    stat: '3+',
    title: 'Autonomous AI agents',
    body: 'Atlas job-search agent, B2B sales agent, and more.',
  },
  {
    stat: '4y',
    title: 'Building software',
    body: 'From county-government backends to virtual fitting rooms.',
  },
]

export function About() {
  return (
    <section id="about" className="py-32">
      <div className="max-w-5xl mx-auto px-6">

        {/* Two-column: text left, photo right */}
        <div className="flex flex-col-reverse lg:flex-row lg:items-start gap-12 lg:gap-16">

          <div className="flex-1">
            <p className="font-mono text-sm text-[#64ffda] mb-3">01. About</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#ccd6f6] tracking-tight mb-8">
              About <span className="text-[#64ffda]">me</span>
            </h2>

            <div className="space-y-5 text-lg text-[#8892b0] leading-relaxed">
              <p>
                I&apos;m Samuel — a Full Stack Software &amp; AI Engineer based in Nairobi,
                Kenya. I build the things I wish existed: mobile apps that respect
                your time, backends that don&apos;t fall over, and AI agents that
                actually finish the job instead of just suggesting it.
              </p>
              <p>
                My day-to-day stack is{' '}
                <strong className="text-[#ccd6f6]">Flutter / Dart</strong> for mobile,{' '}
                <strong className="text-[#ccd6f6]">Python &amp; Django</strong> for backends, and{' '}
                <strong className="text-[#ccd6f6]">LLMs + PostgreSQL</strong> for the autonomous
                agent work. I&apos;ve shipped two apps to the Google Play Store —{' '}
                <em className="text-[#ccd6f6]">Stratum</em> and{' '}
                <em className="text-[#ccd6f6]">Number Your Days</em> — and I&apos;m currently
                pursuing an M.Sc. in Information Technology at Strathmore University.
              </p>
              <p>
                What gets me excited: clean architecture, token-optimized AI, and
                watching a real workflow get fully automated end to end. I also
                teach — I lead workshops on integrating LLMs into mobile apps.
              </p>
            </div>
          </div>

          {/* Photo */}
          <div className="lg:shrink-0 flex justify-center lg:justify-end lg:pt-20">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72">
              <div className="absolute inset-0 rounded-2xl bg-[rgba(100,255,218,0.15)] blur-2xl translate-x-3 translate-y-3" />
              <Image
                src="/photo.jpeg"
                alt="Samuel Shadiva"
                width={288}
                height={288}
                className="relative w-full h-full object-cover rounded-2xl border border-[rgba(100,255,218,0.25)] grayscale hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 rounded-2xl border-2 border-[rgba(100,255,218,0.15)] translate-x-2 translate-y-2 -z-10" />
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid sm:grid-cols-3 gap-5 mt-16">
          {HIGHLIGHTS.map(h => (
            <div
              key={h.title}
              className="rounded-2xl p-6 bg-[#0a192f] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(100,255,218,0.25)] transition-colors"
            >
              <div className="font-display text-3xl font-bold text-[#64ffda]">{h.stat}</div>
              <div className="mt-1 text-sm font-medium text-[#ccd6f6]">{h.title}</div>
              <p className="mt-2 text-sm text-[#8892b0]">{h.body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
