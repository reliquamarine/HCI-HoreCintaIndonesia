import { ExternalLink, Globe } from 'lucide-react'
import { extractDomain } from '../../utils/dateGroups.js'
import {
  formatScore,
  getSourceTypeLabel,
} from '../../utils/verificationLabels.js'
import { StanceBadge } from './VerdictBadge.jsx'

export function EvidenceCard({ evidence }) {
  const domain = extractDomain(evidence.url)

  return (
    <article className="rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-line-strong">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-secondary">
            <Globe className="h-3 w-3 text-ink-muted" aria-hidden="true" />
            <span>{getSourceTypeLabel(evidence.sourceType)}</span>
          </span>
          <StanceBadge stance={evidence.stance} />
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tabular-nums text-ink-secondary">
          <span className="rounded-md bg-surface-muted px-2 py-0.5">
            Kredibilitas {formatScore(evidence.credibility)}
          </span>
          <span className="rounded-md bg-surface-muted px-2 py-0.5">
            Relevansi {formatScore(evidence.relevance)}
          </span>
        </div>
      </div>

      <h5 className="mt-2.5 text-sm font-semibold leading-snug text-ink">
        {evidence.title}
      </h5>

      {evidence.url && (
        <a
          href={evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex max-w-full items-center gap-1.5 text-xs font-medium text-brand hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{evidence.url}</span>
        </a>
      )}

      {evidence.snippet && (
        <div className="mt-2.5 rounded-xl bg-surface-muted px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              Kutipan Sumber
            </span>
            {domain && (
              <span className="text-[11px] text-ink-muted">{domain}</span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
            {evidence.snippet}
          </p>
        </div>
      )}
    </article>
  )
}
