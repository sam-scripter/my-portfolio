import { Mail, MapPin, MessageSquare } from 'lucide-react'
import { Button } from '../ui/Button'
import { SectionHeader } from '../ui/SectionHeader'

interface ContactProps {
  onOpenChat: () => void
}

export function Contact({ onOpenChat }: ContactProps) {
  return (
    <section id="contact" className="py-24 max-w-6xl mx-auto px-6">
      <SectionHeader
        title="Get in Touch"
        subtitle="Open to the right opportunities. Reach out directly or ask my AI assistant."
      />

      <div className="grid md:grid-cols-2 gap-12">

        {/* Direct contact links */}
        <div className="space-y-4">

          <a
            href="mailto:shadivasam@gmail.com"
            className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary-300 hover:bg-surface-2 transition-all group"
          >
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary group-hover:text-primary-600 transition-colors">
                Email
              </p>
              <p className="text-sm text-text-muted">shadivasam@gmail.com</p>
            </div>
          </a>

          <a
            href="https://linkedin.com/in/samuelshadiva"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary-300 hover:bg-surface-2 transition-all group"
          >
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-primary-600 dark:text-primary-400"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary group-hover:text-primary-600 transition-colors">
                LinkedIn
              </p>
              <p className="text-sm text-text-muted">linkedin.com/in/samuelshadiva</p>
            </div>
          </a>

          <a
            href="https://github.com/Sam-scripter"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary-300 hover:bg-surface-2 transition-all group"
          >
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-primary-600 dark:text-primary-400"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary group-hover:text-primary-600 transition-colors">
                GitHub
              </p>
              <p className="text-sm text-text-muted">github.com/Sam-scripter</p>
            </div>
          </a>

          <div className="flex items-center gap-3 px-4 py-3 text-sm text-text-muted">
            <MapPin size={14} />
            Nairobi, Kenya · EAT (UTC+3)
          </div>
        </div>

        {/* AI assistant CTA */}
        <div className="bg-surface-2 border border-primary-200 dark:border-primary-800 rounded-2xl p-8 flex flex-col justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-5">
            <MessageSquare size={22} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-3">
            Check if I&apos;m the right fit
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            Paste a job description and my AI assistant will analyse how I match
            the requirements — with specific evidence from my actual experience.
          </p>
          <Button onClick={onOpenChat} size="lg">
            Open AI Assistant
            <MessageSquare size={16} />
          </Button>
        </div>

      </div>
    </section>
  )
}