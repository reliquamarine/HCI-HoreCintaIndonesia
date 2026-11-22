import { Activity, ChevronUp, Maximize2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MODE_META } from '../../utils/verificationLabels.js'
import { Modal } from '../ui/Modal.jsx'
import { ClaimDetailPanel } from './ClaimDetailPanel.jsx'
import { ClaimListItem } from './ClaimListItem.jsx'
import { VerdictBadge } from './VerdictBadge.jsx'

function ClaimsMasterDetail({
  claims,
  selectedClaimIndex,
  flashingClaimIndex,
  onSelectClaim,
  mode,
  isUpgrading,
  onUpgradeMode,
}) {
  const activePos = Math.max(
    0,
    claims.findIndex((c) => c.index === selectedClaimIndex),
  )
  const activeClaim = claims[activePos] || claims[0]

  function handleTabListKeyDown(event) {
    if (claims.length <= 1) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      const next = claims[(activePos + 1) % claims.length]
      onSelectClaim(next.index)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const prev = claims[(activePos - 1 + claims.length) % claims.length]
      onSelectClaim(prev.index)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-[265px_minmax(0,1fr)] md:items-start">
      <div
        role="tablist"
        aria-label="Daftar klaim terverifikasi"
        onKeyDown={handleTabListKeyDown}
        className="flex min-w-0 gap-2.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
      >
        {claims.map((claim) => (
          <ClaimListItem
            key={claim.id}
            claim={claim}
            isSelected={activeClaim?.index === claim.index}
            isFlashing={flashingClaimIndex === claim.index}
            onSelect={onSelectClaim}
          />
        ))}
      </div>

      <div className="min-w-0">
        <ClaimDetailPanel
          key={`${activeClaim?.id}_${mode}`}
          claim={activeClaim}
          mode={mode}
          isUpgrading={isUpgrading}
          onUpgradeMode={onUpgradeMode}
        />
      </div>
    </div>
  )
}

export function ClaimsOverview({
  panelId,
  claims,
  mode = 'basic',
  selectedClaimIndex,
  flashingClaimIndex,
  onSelectClaim,
  isUpgrading = false,
  onUpgradeMode,
  onClosePanel,
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const verdictSummary = useMemo(() => {
    const map = new Map()
    for (const claim of claims || []) {
      map.set(claim.verdict, (map.get(claim.verdict) || 0) + 1)
    }
    return Array.from(map.entries())
  }, [claims])

  if (!Array.isArray(claims) || claims.length === 0) return null

  const modeInfo = MODE_META[mode] || MODE_META.basic

  return (
    <>
      <div
        id={panelId}
        className="rounded-2xl border border-line bg-surface-muted/70 p-3.5 sm:p-4"
      >
        <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Activity
                  className="h-4 w-4 text-brand"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-bold text-ink">Ringkasan Klaim</h3>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {verdictSummary.map(([verdict, count]) => (
                  <span
                    key={verdict}
                    className="inline-flex items-center gap-1"
                  >
                    <VerdictBadge verdict={verdict} compact />
                    <span className="font-mono text-[11px] font-semibold tabular-nums text-ink-secondary">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
              {modeInfo.description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
              title="Buka tampilan fokus layar penuh"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Perbesar</span>
            </button>

            {onClosePanel && (
              <button
                type="button"
                onClick={onClosePanel}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-surface text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
                aria-label="Sembunyikan Ringkasan Klaim"
                title="Sembunyikan"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <ClaimsMasterDetail
          claims={claims}
          selectedClaimIndex={selectedClaimIndex}
          flashingClaimIndex={flashingClaimIndex}
          onSelectClaim={onSelectClaim}
          mode={mode}
          isUpgrading={isUpgrading}
          onUpgradeMode={onUpgradeMode}
        />
      </div>

      <Modal
        open={isExpanded}
        onClose={() => setIsExpanded(false)}
        title="Ringkasan Klaim dan Bukti Sumber"
        description={modeInfo.description}
        maxWidthClass="max-w-5xl"
      >
        <ClaimsMasterDetail
          claims={claims}
          selectedClaimIndex={selectedClaimIndex}
          flashingClaimIndex={flashingClaimIndex}
          onSelectClaim={onSelectClaim}
          mode={mode}
          isUpgrading={isUpgrading}
          onUpgradeMode={onUpgradeMode}
        />
      </Modal>
    </>
  )
}
