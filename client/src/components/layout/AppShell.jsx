import { useCallback, useEffect, useRef, useState } from 'react'
import { useChat } from '../../hooks/useChat.js'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts.js'
import { cn } from '../../utils/cn.js'
import { Sidebar } from '../sidebar/Sidebar.jsx'
import { Toast } from '../ui/Toast.jsx'
import { TopHeader } from './TopHeader.jsx'

export function AppShell({ children }) {
  const { createNewSession } = useChat()
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const desktopSearchRef = useRef(null)
  const mobileSearchRef = useRef(null)

  const focusSearch = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setIsDesktopSidebarOpen(true)
      setTimeout(() => desktopSearchRef.current?.focus(), 60)
    } else {
      setIsMobileSidebarOpen(true)
      setTimeout(() => mobileSearchRef.current?.focus(), 100)
    }
  }, [])

  useKeyboardShortcuts({
    onFocusSearch: focusSearch,
    onNewChat: createNewSession,
  })

  useEffect(() => {
    if (!isMobileSidebarOpen) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMobileSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileSidebarOpen])

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas text-ink">
      <a
        href="#main-chat-area"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-[var(--shadow-float)]"
      >
        Lewati ke area percakapan
      </a>

      {/* Desktop collapsible sidebar */}
      <div
        className={cn(
          'hidden shrink-0 transition-[width] duration-200 ease-out lg:block overflow-hidden',
          isDesktopSidebarOpen ? 'w-[280px]' : 'w-0',
        )}
        aria-hidden={!isDesktopSidebarOpen}
      >
        <div className="h-full w-[280px]">
          <Sidebar searchInputRef={desktopSearchRef} />
        </div>
      </div>

      {/* Mobile slide-over drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigasi riwayat percakapan"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full w-[290px] max-w-[85vw] shadow-[var(--shadow-float)]">
            <Sidebar
              searchInputRef={mobileSearchRef}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main chat canvas */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          onToggleDesktopSidebar={() => setIsDesktopSidebarOpen((prev) => !prev)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        <main
          id="main-chat-area"
          className="relative flex min-h-0 flex-1 flex-col"
        >
          {children}
        </main>
      </div>

      <Toast />
    </div>
  )
}
