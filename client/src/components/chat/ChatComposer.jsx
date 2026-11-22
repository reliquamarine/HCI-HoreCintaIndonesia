import { ArrowUp, Layers, Sparkles, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/cn.js'

const MAX_LENGTH = 2000

export function ChatComposer({
  onSend,
  onStop,
  isGenerating,
  verificationMode,
  onChangeMode,
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`
  }, [value])

  const trimmed = value.trim()
  const canSend = trimmed.length > 0 && !isGenerating && value.length <= MAX_LENGTH

  function handleSubmit() {
    if (!canSend) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="shrink-0 bg-linear-to-t from-canvas via-canvas to-canvas/0 px-3 pt-2 pb-3 sm:px-6 sm:pb-4">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl border border-line bg-surface shadow-(--shadow-card) transition-colors focus-within:border-brand">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_LENGTH}
            placeholder="Ajukan pertanyaan atau klaim yang ingin diverifikasi..."
            aria-label="Tulis pertanyaan untuk FritoGrafi"
            className="block max-h-42 w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm leading-relaxed text-ink placeholder:text-ink-muted focus:outline-none sm:text-[15px]"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2.5 pt-1">
            <div
              className="inline-flex items-center rounded-xl border border-line bg-surface-muted p-0.5"
              role="group"
              aria-label="Pilih mode verifikasi klaim"
            >
              <button
                type="button"
                onClick={() => onChangeMode('basic')}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors',
                  verificationMode === 'basic'
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-ink-secondary hover:text-ink',
                )}
                aria-pressed={verificationMode === 'basic'}
                title="Mode Dasar menampilkan fakta inti dan ringkasan bukti utama"
              >
                <Layers className="h-3.5 w-3.5 text-brand" />
                <span>Dasar</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeMode('comprehensive')}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors',
                  verificationMode === 'comprehensive'
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-ink-secondary hover:text-ink',
                )}
                aria-pressed={verificationMode === 'comprehensive'}
                title="Mode Mendalam menampilkan analisis penalaran lengkap tiap klaim"
              >
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                <span>Mendalam</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              {value.length > 1200 && (
                <span
                  className={cn(
                    'font-mono text-[11px] tabular-nums',
                    value.length >= MAX_LENGTH ? 'text-brand font-semibold' : 'text-ink-muted',
                  )}
                >
                  {value.length}/{MAX_LENGTH}
                </span>
              )}

              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink px-3.5 text-xs font-semibold text-canvas transition-opacity hover:opacity-90"
                  aria-label="Hentikan penyusunan jawaban"
                >
                  <Square className="h-3 w-3 fill-current" />
                  <span>Hentikan</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSend}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-hover disabled:bg-surface-hover disabled:text-ink-muted"
                  aria-label="Kirim pertanyaan"
                  title="Kirim (Enter)"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-[11px] leading-normal text-ink-muted">
          FritoGrafi memverifikasi klaim dari sumber terbuka. Periksa kembali tautan rujukan untuk keputusan penting.
        </p>
      </div>
    </div>
  )
}
