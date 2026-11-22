import { useContext } from 'react'
import { ChatContext } from '../context/chatContextValue.js'

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat harus digunakan di dalam ChatProvider')
  }
  return context
}
