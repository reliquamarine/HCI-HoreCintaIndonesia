import { ChatWorkspace } from './components/chat/ChatWorkspace.jsx'
import { AppShell } from './components/layout/AppShell.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <AppShell>
          <ChatWorkspace />
        </AppShell>
      </ChatProvider>
    </ThemeProvider>
  )
}

export default App
