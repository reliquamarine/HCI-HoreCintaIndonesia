import { Upload } from 'lucide-react'
import {
  MAX_FILES_PER_MESSAGE,
  MAX_FILE_SIZE_MB,
} from '../../utils/fileAttachments.js'

export function DropzoneOverlay({ visible }) {
  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-canvas/85 p-6 backdrop-blur-[2px] animate-fade-up"
      aria-hidden="true"
    >
      <div className="flex max-w-md flex-col items-center rounded-2xl border-2 border-dashed border-brand bg-surface px-8 py-9 text-center shadow-(--shadow-float)">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Upload className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-bold text-ink">
          Lepaskan file di sini untuk melampirkan
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
          Mendukung PDF, DOCX, TXT, MD, CSV, serta gambar PNG, JPG, dan WEBP
          (maksimal {MAX_FILES_PER_MESSAGE} file, {MAX_FILE_SIZE_MB} MB per
          file).
        </p>
      </div>
    </div>
  )
}
