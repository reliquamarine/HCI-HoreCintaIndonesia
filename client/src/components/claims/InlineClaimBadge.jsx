import { useState } from 'react'
import { formatScore } from '../../utils/verificationLabels.js'
import { VerdictBadge } from './VerdictBadge.jsx'

export function InlineClaimBadge({ claim, onSelect }) {
  const [hovered, setHovered] = useState(false)

  if (!claim) return null

  return (
    <span
      className="relative mx-0.5 inline-block align-baseline"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => onSelect?.(claim.index)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-gold-border bg-gold-bg px-1.5 font-mono text-[11px] font-semibold leading-none text-gold-text transition-transform hover:-translate-y-0.5"
        aria-label={`Lihat verifikasi Klaim ${claim.index}`}
      >
        {claim.index}
      </button>

      {hovered && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-72 -translate-x-1/2 rounded-xl border border-line bg-surface p-3 text-left shadow-(--shadow-float) sm:block animate-fade-up"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-ink">
              Klaim {claim.index}
            </span>
            <VerdictBadge verdict={claim.verdict} compact />
          </span>
          <span className="mt-1.5 block line-clamp-3 text-xs leading-relaxed text-ink-secondary">
            {claim.statement}
          </span>
          <span className="mt-2 flex items-center justify-between border-t border-line pt-1.5 text-[11px] text-ink-muted">
            <span className="font-mono tabular-nums">
              Keyakinan {formatScore(claim.confidence)}
            </span>
            <span>Klik untuk detail bukti</span>
          </span>
        </span>
      )}
    </span>
  )
}
