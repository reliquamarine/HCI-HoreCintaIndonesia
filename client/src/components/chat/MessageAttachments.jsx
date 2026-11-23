import { FileSpreadsheet, FileText, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { formatFileSize } from '../../utils/fileAttachments.js'
import { Modal } from '../ui/Modal.jsx'

export function MessageAttachments({ attachments, runtimeAttachments }) {
  const [activePreview, setActivePreview] = useState(null)

  if (!Array.isArray(attachments) || attachments.length === 0) return null

  function resolvePreviewUrl(item) {
    return runtimeAttachments?.[item.id]?.previewUrl || null
  }

  return (
    <>
      <div className="mb-2.5 flex flex-wrap gap-2">
        {attachments.map((item) => {
          const previewUrl = resolvePreviewUrl(item)
          const extLabel = (item.extension || 'FILE').toUpperCase()
          const DocIcon = item.extension === 'csv' ? FileSpreadsheet : FileText

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePreview({ ...item, previewUrl })}
              className="flex max-w-full items-center gap-2.5 rounded-xl border border-line bg-surface/90 p-1.5 pr-3 text-left transition-colors hover:border-brand-border hover:bg-surface"
              title={`Lihat detail ${item.name}`}
            >
              {item.isImage && previewUrl ? (
                <img
                  src={previewUrl}
                  alt={item.name}
                  className="h-9 w-9 shrink-0 rounded-lg border border-line object-cover"
                />
              ) : item.isImage ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-muted text-brand">
                  <ImageIcon className="h-4 w-4" aria-hidden="true" />
                </div>
              ) : (
                <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-surface-muted text-brand">
                  <DocIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="mt-0.5 font-mono text-[8px] font-bold leading-none text-ink-secondary">
                    {extLabel}
                  </span>
                </div>
              )}

              <div className="min-w-0 max-w-44">
                <div className="truncate text-xs font-semibold text-ink">
                  {item.name}
                </div>
                <div className="mt-0.5 font-mono text-[11px] tabular-nums text-ink-muted">
                  {formatFileSize(item.size)}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <Modal
        open={Boolean(activePreview)}
        onClose={() => setActivePreview(null)}
        title={activePreview?.name}
        description={
          activePreview
            ? `Format ${(activePreview.extension || 'FILE').toUpperCase()}, ukuran ${formatFileSize(activePreview.size)}`
            : ''
        }
        maxWidthClass="max-w-3xl"
      >
        {activePreview?.isImage && activePreview.previewUrl ? (
          <div className="flex justify-center rounded-xl bg-surface-muted p-2">
            <img
              src={activePreview.previewUrl}
              alt={activePreview.name}
              className="max-h-[68dvh] w-auto rounded-lg object-contain"
            />
          </div>
        ) : activePreview?.textExcerpt ? (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Cuplikan Isi Dokumen
            </div>
            <pre className="max-h-[55dvh] overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-surface-muted p-4 font-mono text-xs leading-relaxed text-ink">
              {activePreview.textExcerpt}
            </pre>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-surface-muted p-4 text-sm leading-relaxed text-ink-secondary">
            File ini telah dilampirkan pada pesan percakapan. Untuk menjaga
            privasi dan kapasitas penyimpanan browser, isi file biner tidak
            disimpan permanen di penyimpanan lokal.
          </div>
        )}
      </Modal>
    </>
  )
}
