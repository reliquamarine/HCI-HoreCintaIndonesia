import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal.jsx'

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  danger = true,
}) {
  return (
    <Modal open={open} onClose={onClose} maxWidthClass="max-w-md">
      <div className="flex items-start gap-3.5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
          style={{
            backgroundColor: danger
              ? 'var(--status-contradicted-bg)'
              : 'var(--bg-surface-muted)',
            borderColor: danger
              ? 'var(--status-contradicted-border)'
              : 'var(--border-subtle)',
            color: danger
              ? 'var(--status-contradicted-text)'
              : 'var(--text-primary)',
          }}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-hover"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm?.()
            onClose?.()
          }}
          className="rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors"
          style={{
            backgroundColor: danger
              ? 'var(--accent-primary)'
              : 'var(--text-primary)',
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
