const PHASE_LABELS = {
  reading_files: 'Membaca isi dokumen terlampir...',
  verifying: 'Menelusuri sumber referensi dan memverifikasi klaim...',
  waking_server:
    'Menghubungkan ke server dan menganalisis bukti sumber, mohon tunggu sebentar...',
  streaming: 'Menyusun jawaban beserta rujukan...',
}

export function TypingIndicator({ phase = 'verifying' }) {
  const label = PHASE_LABELS[phase] || PHASE_LABELS.verifying

  return (
    <div
      className="inline-flex items-center gap-3 rounded-xl border border-line bg-surface-muted px-3.5 py-2.5 text-xs font-medium text-ink-secondary"
      role="status"
      aria-live="polite"
    >
      <span className="flex items-end gap-1" aria-hidden="true">
        <span
          className="h-3 w-1 rounded-full bg-brand animate-pulse-bar"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-3.5 w-1 rounded-full bg-brand animate-pulse-bar"
          style={{ animationDelay: '180ms' }}
        />
        <span
          className="h-2.5 w-1 rounded-full bg-brand animate-pulse-bar"
          style={{ animationDelay: '360ms' }}
        />
      </span>
      <span>{label}</span>
    </div>
  )
}
