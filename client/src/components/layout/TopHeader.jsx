import {
  Check,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useChat } from '../../hooks/useChat.js'
import { useTheme } from '../../hooks/useTheme.js'
import { MODE_META } from '../../utils/verificationLabels.js'

export function TopHeader({
  isDesktopSidebarOpen,
  onToggleDesktopSidebar,
  onOpenMobileSidebar,
}) {
  const {
    activeSession,
    verificationMode,
    createNewSession,
    renameSession,
  } = useChat()
  const { isDark, toggleTheme } = useTheme()

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const titleInputRef = useRef(null)

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }
  }, [isEditingTitle])

  function startEditTitle() {
    if (!activeSession) return
    setTitleDraft(activeSession.title)
    setIsEditingTitle(true)
  }

  function saveTitle() {
    if (activeSession) {
      const trimmed = titleDraft.trim()
      if (trimmed && trimmed !== activeSession.title) {
        renameSession(activeSession.id, trimmed)
      }
    }
    setIsEditingTitle(false)
  }

  function handleTitleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      saveTitle()
    } else if (event.key === 'Escape') {
      setIsEditingTitle(false)
    }
  }

  const modeInfo = MODE_META[verificationMode] || MODE_META.basic

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-canvas/90 px-3 backdrop-blur-md sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink lg:hidden"
          aria-label="Buka menu riwayat percakapan"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleDesktopSidebar}
          className="hidden h-9 w-9 items-center justify-center rounded-xl text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink lg:flex"
          aria-label={
            isDesktopSidebarOpen ? 'Sembunyikan panel samping' : 'Tampilkan panel samping'
          }
          title={isDesktopSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
        >
          {isDesktopSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        {isEditingTitle ? (
          <div className="flex items-center gap-1 rounded-xl border border-brand bg-surface px-2.5 py-1">
            <input
              ref={titleInputRef}
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleTitleKeyDown}
              maxLength={80}
              aria-label="Edit judul percakapan aktif"
              className="w-44 bg-transparent text-sm font-semibold text-ink focus:outline-none sm:w-64"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={saveTitle}
              className="flex h-6 w-6 items-center justify-center rounded-md text-brand hover:bg-brand-soft"
              aria-label="Simpan judul percakapan"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditTitle}
            className="group flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1 text-left transition-colors hover:bg-surface-hover"
            title="Klik untuk mengubah judul percakapan"
          >
            <span className="truncate text-sm font-semibold text-ink max-w-[160px] sm:max-w-xs md:max-w-md">
              {activeSession?.title || 'Percakapan Baru'}
            </span>
            <Pencil className="h-3 w-3 shrink-0 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div
          className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:inline-flex"
          style={{
            backgroundColor: 'var(--status-supported-bg)',
            borderColor: 'var(--status-supported-border)',
            color: 'var(--status-supported-text)',
          }}
          title={modeInfo.description}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{modeInfo.badgeLabel}</span>
        </div>

        <button
          type="button"
          onClick={createNewSession}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:bg-surface-hover sm:px-3"
          title="Mulai percakapan baru (Ctrl+Shift+O)"
        >
          <Plus className="h-4 w-4 text-brand" />
          <span className="hidden sm:inline">Baru</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
          aria-label={isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
          title={isDark ? 'Tema Terang' : 'Tema Gelap'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}
