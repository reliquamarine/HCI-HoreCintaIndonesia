import { FileText } from 'lucide-react'
import { cn } from '../../utils/cn.js'
import {
  formatScore,
  getVerdictMeta,
} from '../../utils/verificationLabels.js'
import { VerdictBadge } from './VerdictBadge.jsx'

export function ClaimListItem({
  claim,
  isSelected,
  isFlashing = false,
  onSelect,
}) {
  const meta = getVerdictMeta(claim.verdict)
  const sourcesCount = Array.isArray(claim.evidence) ? claim.evidence.length : 0
  const confidencePct = Math.round(
    Math.min(1, Math.max(0, claim.confidence || 0)) * 100,
  )

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => onSelect(claim.index)}
      className={cn(
        'w-full min-w-[235px] shrink-0 rounded-2xl border bg-surface p-3.5 text-left transition-all md:min-w-0',
        isSelected
          ? 'shadow-[var(--shadow-card)]'
          : 'border-line hover:border-line-strong hover:bg-surface-hover/50',
        isFlashing && 'animate-claim-flash',
      )}
      style={
        isSelected
          ? {
              borderColor: meta.borderVar,
              boxShadow: `0 0 0 1px ${meta.borderVar}, var(--shadow-card)`,
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2.5">
        <VerdictBadge verdict={claim.verdict} compact />
        <div className="shrink-0 rounded-xl border border-line bg-surface-muted px-2.5 py-1 text-right">
          <div className="text-[10px] font-medium text-ink-muted">
            Keyakinan
          </div>
          <div className="font-mono text-xs font-bold tabular-nums text-ink">
            {formatScore(claim.confidence)}
          </div>
        </div>
      </div>

      <div className="mt-2.5">
        <div className="text-xs font-bold text-ink">Klaim {claim.index}</div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-secondary">
          {claim.statement}
        </p>
      </div>

      <div className="mt-3">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${confidencePct}%`,
              backgroundColor: meta.barColor,
            }}
          />
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
          <FileText className="h-3 w-3 text-ink-muted" aria-hidden="true" />
          <span>{sourcesCount} Sumber</span>
        </span>
        <span className="font-mono text-[11px] tabular-nums text-ink-muted">
          {confidencePct}%
        </span>
      </div>
    </button>
  )
}
