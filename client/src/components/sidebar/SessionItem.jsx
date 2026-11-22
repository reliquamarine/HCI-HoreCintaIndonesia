import { Check, MessageSquare, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/cn.js'

export function SessionItem({
  session,
  isActive,
  onSelect,
  onRename,
  onRequestDelete,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(session.title)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  function startEditing(event) {
    event.stopPropagation()
    setDraftTitle(session.title)
    setIsEditing(true)
  }

  function submitRename() {
    const trimmed = draftTitle.trim()
    if (trimmed && trimmed !== session.title) {
      onRename(session.id, trimmed)
    }
    setIsEditing(false)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      submitRename()
    } else if (event.key === 'Escape') {
      setIsEditing(false)
      setDraftTitle(session.title)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 rounded-xl border border-brand bg-surface px-2 py-1.5">
        <input
          ref={inputRef}
          type="text"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={submitRename}
          maxLength={80}
          aria-label="Ubah judul percakapan"
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-ink focus:outline-none"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={submitRename}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-hover hover:text-ink"
          aria-label="Simpan judul"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setIsEditing(false)
            setDraftTitle(session.title)
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-hover hover:text-ink"
          aria-label="Batalkan ubah judul"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 rounded-xl transition-colors',
        isActive
          ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(28,25,23,0.06)] ring-1 ring-line'
          : 'text-ink-secondary hover:bg-surface-hover hover:text-ink',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(session.id)}
        className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left"
        aria-current={isActive ? 'page' : undefined}
      >
        <MessageSquare
          className={cn(
            'h-4 w-4 shrink-0',
            isActive ? 'text-brand' : 'text-ink-muted',
          )}
          aria-hidden="true"
        />
        <span className="truncate text-sm font-medium">{session.title}</span>
      </button>

      <div
        className={cn(
          'flex shrink-0 items-center gap-0.5 pr-1.5 transition-opacity',
          isActive
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100',
        )}
      >
        <button
          type="button"
          onClick={startEditing}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          aria-label={`Ubah nama percakapan ${session.title}`}
          title="Ubah nama"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRequestDelete(session)
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-brand-soft hover:text-brand"
          aria-label={`Hapus percakapan ${session.title}`}
          title="Hapus"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
