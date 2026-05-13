import { FitReport as FitReportType } from '@/types'
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'

interface FitReportProps {
  report: FitReportType
}

export function FitReport({ report }: FitReportProps) {
  const scoreColor =
    report.overall_score >= 8
      ? 'text-green-600 dark:text-green-400'
      : report.overall_score >= 6
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400'

  const scoreBg =
    report.overall_score >= 8
      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      : report.overall_score >= 6
      ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
      : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'

  return (
    <div className="border border-border rounded-xl overflow-hidden text-sm">

      {/* Score header */}
      <div className={['p-4 border-b border-border', scoreBg].join(' ')}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-text-primary">Fit Analysis</span>
          <span className={['text-2xl font-bold', scoreColor].join(' ')}>
            {report.overall_score}
            <span className="text-sm font-normal text-text-muted">/10</span>
          </span>
        </div>
        <p className="text-text-secondary text-xs leading-relaxed">{report.summary}</p>
      </div>

      {/* Requirements */}
      {report.requirements.length > 0 && (
        <div className="p-3 border-b border-border">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Requirements
          </p>
          <div className="space-y-2">
            {report.requirements.map((req, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  {req.matched ? (
                    <CheckCircle size={13} className="text-green-500" />
                  ) : (
                    <XCircle size={13} className="text-red-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-text-primary font-medium text-xs">{req.requirement}</p>
                  {req.evidence && (
                    <p className="text-text-muted text-xs mt-0.5 leading-relaxed">{req.evidence}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps */}
      {report.gaps.length > 0 && (
        <div className="p-3 border-b border-border">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Gaps
          </p>
          <ul className="space-y-1">
            {report.gaps.map((gap, i) => (
              <li key={i} className="flex gap-2 text-xs text-text-secondary">
                <span className="text-amber-400 flex-shrink-0">·</span>
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested questions */}
      {report.suggested_questions.length > 0 && (
        <div className="p-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Suggested questions
          </p>
          <ul className="space-y-1.5">
            {report.suggested_questions.map((q, i) => (
              <li key={i} className="flex gap-2 text-xs text-text-secondary">
                <HelpCircle size={11} className="text-primary-400 flex-shrink-0 mt-0.5" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}