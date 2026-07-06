export function Contact() {
  return (
    <section id="contact" className="py-32">
      <div className="max-w-xl mx-auto px-6 text-center">

        <p className="font-mono text-sm text-[#64ffda] mb-4">04. What&apos;s Next?</p>

        <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#ccd6f6] tracking-tight">
          Get In Touch
        </h2>

        <p className="mt-6 text-lg text-[#8892b0] leading-relaxed">
          I&apos;m currently open to full-time roles, freelance projects, and AI
          consulting. Whether you have something in mind or just want to
          connect, my inbox is always open.
        </p>

        <a
          href="mailto:shadivasam@gmail.com"
          className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-[rgba(100,255,218,0.4)] text-[#64ffda] hover:bg-[rgba(100,255,218,0.08)] transition-colors font-mono text-sm"
        >
          Say Hello
        </a>

        <div className="mt-6 font-mono text-sm text-[#8892b0]">
          shadivasam@gmail.com
        </div>

      </div>
    </section>
  )
}
