import {
  Activity,
  Check,
  Copy,
  Pencil,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../utils/cn.js'

export function MessageActionBar({
  role,
  content,
  feedback,
  claimsCount = 0,
  isClaimsOpen = false,
  onToggleClaims,
  onCopy,
  onRegenerate,
  onEdit,
  onFeedback,
  disabled = false,
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content || '')
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Ignore clipboard failure
    }
  }

  if (role === 'user') {
    return (
      <div className="mt-1.5 flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          aria-label="Salin pesan"
          title="Salin pesan"
        >
          {copied ? (
            <>
              <Check
                className="h-3.5 w-3.5"
                style={{ color: 'var(--status-supported-text)' }}
              />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Salin</span>
            </>
          )}
        </button>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            disabled={disabled}
            className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink disabled:opacity-40"
            aria-label="Ubah dan kirim ulang pesan"
            title="Ubah pesan"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Ubah</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
        aria-label="Salin jawaban"
      >
        {copied ? (
          <>
            <Check
              className="h-3.5 w-3.5"
              style={{ color: 'var(--status-supported-text)' }}
            />
            <span>Tersalin</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Salin</span>
          </>
        )}
      </button>

      {onRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          disabled={disabled}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink disabled:opacity-40"
          aria-label="Buat ulang jawaban"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Jawab Ulang</span>
        </button>
      )}

      {claimsCount > 0 && onToggleClaims && (
        <button
          type="button"
          onClick={onToggleClaims}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors',
            isClaimsOpen
              ? 'border-brand-border bg-brand-soft text-brand'
              : 'border-line bg-surface text-ink-secondary hover:bg-surface-hover hover:text-ink',
          )}
          aria-expanded={isClaimsOpen}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>
            {isClaimsOpen
              ? `Sembunyikan Klaim (${claimsCount})`
              : `Lihat ${claimsCount} Klaim`}
          </span>
        </button>
      )}

      {onFeedback && (
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onFeedback('up')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              feedback === 'up'
                ? 'bg-surface-hover text-ink ring-1 ring-line-strong'
                : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
            )}
            style={
              feedback === 'up'
                ? {
                    backgroundColor: 'var(--status-supported-bg)',
                    color: 'var(--status-supported-text)',
                  }
                : undefined
            }
            aria-label="Jawaban ini membantu"
            aria-pressed={feedback === 'up'}
            title="Membantu"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onFeedback('down')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              feedback === 'down'
                ? 'bg-brand-soft text-brand'
                : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
            )}
            aria-label="Jawaban ini perlu diperbaiki"
            aria-pressed={feedback === 'down'}
            title="Perlu diperbaiki"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
