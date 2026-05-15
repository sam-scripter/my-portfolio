export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.05)] mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center gap-4 text-sm text-[#8892b0]">
        <div className="flex gap-6">
          <a
            href="https://github.com/Sam-scripter"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ccd6f6] transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/samuelshadiva"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ccd6f6] transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="mailto:shadivasam@gmail.com"
            className="hover:text-[#ccd6f6] transition-colors"
          >
            shadivasam@gmail.com
          </a>
        </div>
        <div className="font-mono text-xs">
          © {new Date().getFullYear()} Samuel Shadiva · Designed and Built
        </div>
      </div>
    </footer>
  )
}
