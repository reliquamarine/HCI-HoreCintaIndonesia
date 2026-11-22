import { ExternalLink, Loader2, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '../../utils/cn.js'
import {
  MODE_META,
  formatScore,
  getVerdictMeta,
} from '../../utils/verificationLabels.js'
import { EvidenceCard } from './EvidenceCard.jsx'
import { VerdictBadge } from './VerdictBadge.jsx'

const STANCE_FILTERS = [
  { key: 'ALL', label: 'Semua' },
  { key: 'SUPPORTS', label: 'Mendukung' },
  { key: 'NEUTRAL', label: 'Netral' },
  { key: 'CONTRADICTS', label: 'Membantah' },
]

export function ClaimDetailPanel({
  claim,
  mode = 'basic',
  isUpgrading = false,
  onUpgradeMode,
}) {
  const [stanceFilter, setStanceFilter] = useState('ALL')

  const evidenceList = useMemo(
    () => (Array.isArray(claim?.evidence) ? claim.evidence : []),
    [claim],
  )

  const stanceCounts = useMemo(() => {
    const counts = { ALL: evidenceList.length, SUPPORTS: 0, NEUTRAL: 0, CONTRADICTS: 0 }
    for (const item of evidenceList) {
      if (counts[item.stance] !== undefined) {
        counts[item.stance] += 1
      }
    }
    return counts
  }, [evidenceList])

  const visibleEvidence = useMemo(() => {
    if (stanceFilter === 'ALL') return evidenceList
    return evidenceList.filter((item) => item.stance === stanceFilter)
  }, [evidenceList, stanceFilter])

  if (!claim) return null

  const modeInfo = MODE_META[mode] || MODE_META.basic
  const verdictMeta = getVerdictMeta(claim.verdict)
  const confidencePct = Math.round(
    Math.min(1, Math.max(0, claim.confidence || 0)) * 100,
  )

  return (
    <section
      role="tabpanel"
      aria-label={`Detail Klaim ${claim.index}`}
      className="rounded-2xl border border-line bg-surface p-4 shadow-(--shadow-card) sm:p-5"
    >
      {/* Top metadata badges */}
      <div className="flex flex-wrap items-center gap-2">
        <VerdictBadge verdict={claim.verdict} />

        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink">
          <span className="font-mono tabular-nums">
            Keyakinan {formatScore(claim.confidence)}
          </span>
          <span
            className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-line sm:inline-block"
            aria-hidden="true"
          >
            <span
              className="block h-full rounded-full"
              style={{
                width: `${confidencePct}%`,
                backgroundColor: verdictMeta.barColor,
              }}
            />
          </span>
        </div>

        <span className="rounded-full border border-line bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-secondary">
          {modeInfo.badgeLabel}
        </span>
      </div>

      {/* Full claim statement */}
      <h4 className="mt-3.5 text-base font-bold leading-snug text-ink sm:text-[17px]">
        {claim.statement}
      </h4>

      {/* Verification summary */}
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        {claim.summary}
      </p>

      {/* Mode notice OR full comprehensive reasoning */}
      {mode === 'basic' ? (
        <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-line bg-surface-muted px-3.5 py-3 sm:flex-row sm:items-center">
          <p className="text-xs leading-relaxed text-ink-secondary">
            Mode Dasar hanya menampilkan fakta inti. Aktifkan Mode Mendalam untuk melihat analisis penalaran lengkap tiap klaim.
          </p>
          {onUpgradeMode && (
            <button
              type="button"
              disabled={isUpgrading}
              onClick={onUpgradeMode}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-border bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white disabled:opacity-60"
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Lihat Mode Mendalam</span>
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-gold-border/70 bg-surface-muted p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
            <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            <span>Penalaran Mendalam</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary sm:text-[13px]">
            {claim.reasoning ||
              'Seluruh bukti telah dibandingkan berdasarkan konsistensi data, kredibilitas penerbit, dan kesesuaian konteks klaim.'}
          </p>
        </div>
      )}

      {/* Key Sources */}
      {Array.isArray(claim.keySources) && claim.keySources.length > 0 && (
        <div className="mt-5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Sumber Utama
          </h5>
          <ul className="mt-2 space-y-1.5">
            {claim.keySources.map((source) => (
              <li key={source.url || source.title}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2 rounded-lg py-0.5 text-xs font-medium text-brand transition-colors hover:underline sm:text-[13px]"
                >
                  <ExternalLink
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-75 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                  <span>{source.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence Cards with Stance Filter */}
      {evidenceList.length > 0 && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Bukti Rujukan ({evidenceList.length})
            </h5>

            <div
              className="flex flex-wrap items-center gap-1"
              role="group"
              aria-label="Filter sikap sumber"
            >
              {STANCE_FILTERS.filter(
                (f) => f.key === 'ALL' || stanceCounts[f.key] > 0,
              ).map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setStanceFilter(filter.key)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors',
                    stanceFilter === filter.key
                      ? 'bg-ink text-canvas'
                      : 'bg-surface-muted text-ink-secondary hover:bg-surface-hover hover:text-ink',
                  )}
                  aria-pressed={stanceFilter === filter.key}
                >
                  {filter.label} ({stanceCounts[filter.key]})
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            {visibleEvidence.map((evidence) => (
              <EvidenceCard key={evidence.id} evidence={evidence} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
