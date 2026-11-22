import { useEffect } from 'react'

export function useKeyboardShortcuts({ onFocusSearch, onNewChat }) {
  useEffect(() => {
    function handleKeyDown(event) {
      const isModifier = event.ctrlKey || event.metaKey
      if (!isModifier) return

      if (event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onFocusSearch?.()
      } else if (event.shiftKey && event.key.toLowerCase() === 'o') {
        event.preventDefault()
        onNewChat?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onFocusSearch, onNewChat])
}
