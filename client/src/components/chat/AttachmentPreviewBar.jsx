import { FileSpreadsheet, FileText, X } from 'lucide-react'
import { useState } from 'react'
import {
  MAX_FILES_PER_MESSAGE,
  formatFileSize,
} from '../../utils/fileAttachments.js'
import { Modal } from '../ui/Modal.jsx'

export function AttachmentPreviewBar({ attachments, onRemove }) {
  const [previewImage, setPreviewImage] = useState(null)

  if (!Array.isArray(attachments) || attachments.length === 0) return null

  return (
    <>
      <div className="border-b border-line px-3 pt-2.5 pb-2">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-ink-muted">
            Lampiran siap dikirim
          </span>
          <span className="font-mono text-[11px] tabular-nums text-ink-muted">
            {attachments.length}/{MAX_FILES_PER_MESSAGE} file
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {attachments.map((item) => {
            const extLabel = (item.extension || 'FILE').toUpperCase()
            const DocIcon =
              item.extension === 'csv' ? FileSpreadsheet : FileText

            return (
              <div
                key={item.id}
                className="group flex max-w-full items-center gap-2.5 rounded-xl border border-line bg-surface-muted p-1.5 pr-2 transition-colors hover:border-line-strong"
              >
                {item.isImage && item.previewUrl ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(item)}
                    className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line bg-surface"
                    title={`Pratinjau ${item.name}`}
                    aria-label={`Pratinjau gambar ${item.name}`}
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-surface text-brand">
                    <DocIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="mt-0.5 font-mono text-[8px] font-bold leading-none text-ink-secondary">
                      {extLabel}
                    </span>
                  </div>
                )}

                <div className="min-w-0 max-w-44">
                  <div className="truncate text-xs font-semibold text-ink">
                    {item.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-muted">
                    <span className="font-mono tabular-nums">
                      {formatFileSize(item.size)}
                    </span>
                    {!item.isImage && (
                      <span className="uppercase">{extLabel}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="ml-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-brand-soft hover:text-brand"
                  aria-label={`Hapus lampiran ${item.name}`}
                  title="Hapus lampiran"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <Modal
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        title={previewImage?.name}
        description={
          previewImage ? `Ukuran ${formatFileSize(previewImage.size)}` : ''
        }
        maxWidthClass="max-w-3xl"
      >
        {previewImage?.previewUrl && (
          <div className="flex justify-center rounded-xl bg-surface-muted p-2">
            <img
              src={previewImage.previewUrl}
              alt={previewImage.name}
              className="max-h-[68dvh] w-auto rounded-lg object-contain"
            />
          </div>
        )}
      </Modal>
    </>
  )
}
