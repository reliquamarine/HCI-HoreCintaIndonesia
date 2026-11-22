import { HardDrive, Plus, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useChat } from '../../hooks/useChat.js'
import { groupSessionsByDate } from '../../utils/dateGroups.js'
import { BrandLogo } from '../ui/BrandLogo.jsx'
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx'
import { SessionItem } from './SessionItem.jsx'
import { SessionSearch } from './SessionSearch.jsx'

export function Sidebar({ searchInputRef, onCloseMobile }) {
  const {
    sessions,
    activeSessionId,
    createNewSession,
    selectSession,
    renameSession,
    deleteSession,
    clearAllSessions,
  } = useChat()

  const [query, setQuery] = useState('')
  const [sessionToDelete, setSessionToDelete] = useState(null)
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)

  const filteredSessions = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return sessions
    return sessions.filter((session) => {
      if (session.title.toLowerCase().includes(trimmed)) return true
      return session.messages.some((msg) =>
        msg.content?.toLowerCase().includes(trimmed),
      )
    })
  }, [sessions, query])

  const groupedSessions = useMemo(
    () => groupSessionsByDate(filteredSessions),
    [filteredSessions],
  )

  const hasAnyMessages = sessions.some((s) => s.messages.length > 0) || sessions.length > 1

  function handleSelect(sessionId) {
    selectSession(sessionId)
    onCloseMobile?.()
  }

  function handleNewChat() {
    createNewSession()
    onCloseMobile?.()
  }

  return (
    <>
      <aside
        className="flex h-full w-full flex-col border-r border-line bg-sidebar"
        aria-label="Riwayat percakapan"
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogo className="h-8 w-8" />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold tracking-tight text-ink">
                FritoGrafi
              </div>
              <div className="truncate text-[11px] font-medium text-ink-muted">
                Asisten Verifikasi Klaim
              </div>
            </div>
          </div>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink lg:hidden"
              aria-label="Tutup panel samping"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-2.5 px-3 pb-3">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand px-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
            <span>Chat Baru</span>
          </button>

          <SessionSearch
            value={query}
            onChange={setQuery}
            inputRef={searchInputRef}
          />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Daftar percakapan">
          {groupedSessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line px-4 py-6 text-center">
              <p className="text-xs font-medium text-ink-secondary">
                Tidak ada percakapan yang cocok dengan pencarianmu.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedSessions.map((group) => (
                <div key={group.key}>
                  <h2 className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    {group.label}
                  </h2>
                  <div className="space-y-1">
                    {group.items.map((session) => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        isActive={session.id === activeSessionId}
                        onSelect={handleSelect}
                        onRename={renameSession}
                        onRequestDelete={setSessionToDelete}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-line p-3 space-y-2">
          <div className="flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2 text-xs text-ink-secondary">
            <HardDrive className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
            <span className="truncate">Mode Tamu (tersimpan lokal)</span>
          </div>

          {hasAnyMessages && (
            <button
              type="button"
              onClick={() => setShowClearAllDialog(true)}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-medium text-ink-secondary transition-colors hover:border-brand-border hover:bg-brand-soft hover:text-brand"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Semua Riwayat</span>
            </button>
          )}
        </div>
      </aside>

      <ConfirmDialog
        open={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        onConfirm={() => {
          if (sessionToDelete) deleteSession(sessionToDelete.id)
        }}
        title="Hapus percakapan ini?"
        description={`Percakapan "${sessionToDelete?.title || ''}" beserta seluruh pesan dan ringkasan klaim di dalamnya akan dihapus permanen dari browser ini.`}
        confirmLabel="Ya, Hapus"
      />

      <ConfirmDialog
        open={showClearAllDialog}
        onClose={() => setShowClearAllDialog(false)}
        onConfirm={clearAllSessions}
        title="Hapus seluruh riwayat?"
        description="Semua percakapan yang tersimpan di browser ini akan dibersihkan dan diganti dengan sesi kosong baru."
        confirmLabel="Bersihkan Semua"
      />
    </>
  )
}
