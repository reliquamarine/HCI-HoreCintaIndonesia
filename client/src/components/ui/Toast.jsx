import { CheckCircle2, Info, X } from 'lucide-react'
import { useChat } from '../../hooks/useChat.js'

export function Toast() {
  const { toast, dismissToast } = useChat()

  if (!toast) return null

  const isSuccess = toast.variant === 'success'

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex max-w-sm items-center"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink shadow-(--shadow-float) animate-fade-up">
        {isSuccess ? (
          <CheckCircle2
            className="h-4 w-4 shrink-0"
            style={{ color: 'var(--status-supported-text)' }}
          />
        ) : (
          <Info className="h-4 w-4 shrink-0 text-brand" />
        )}
        <span className="leading-snug">{toast.message}</span>
        <button
          type="button"
          onClick={dismissToast}
          className="ml-1 rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          aria-label="Tutup notifikasi"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
