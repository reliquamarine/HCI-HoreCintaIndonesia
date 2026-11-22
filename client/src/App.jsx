import { AppShell } from './components/layout/AppShell.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <AppShell>
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-md rounded-2xl border border-line bg-surface p-6 text-center shadow-[var(--shadow-card)]">
              <h1 className="text-lg font-semibold text-ink">FritoGrafi</h1>
              <p className="mt-2 text-sm text-ink-secondary">
                AppShell, tema Modern Nusantara, dan sidebar riwayat percakapan siap digunakan.
              </p>
            </div>
          </div>
        </AppShell>
      </ChatProvider>
    </ThemeProvider>
  )
}

export default App
