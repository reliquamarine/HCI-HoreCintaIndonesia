import { useCallback } from 'react'
import { useChat } from '../../hooks/useChat.js'
import { ChatComposer } from './ChatComposer.jsx'
import { MessageList } from './MessageList.jsx'
import { WelcomeScreen } from './WelcomeScreen.jsx'

function createMessageId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function ChatWorkspace() {
  const {
    activeSession,
    verificationMode,
    setVerificationMode,
    isGenerating,
    setIsGenerating,
    abortControllerRef,
    stopGeneration,
    appendMessage,
    updateMessage,
    truncateFromMessage,
    setMessageFeedback,
    showToast,
  } = useChat()

  const runPreviewReply = useCallback(
    async (sessionId, assistantId, query, mode) => {
      const controller = new AbortController()
      abortControllerRef.current = controller
      setIsGenerating(true)

      try {
        await new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, 450)
          controller.signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new DOMException('Dibatalkan', 'AbortError'))
          })
        })

        const reply = `Pertanyaanmu mengenai **"${query}"** sudah diterima pada mode **${mode === 'comprehensive' ? 'Mendalam' : 'Dasar'}**. Panel Ringkasan Klaim beserta kartu sumber verifikasi akan dihubungkan penuh pada Fase 4.`

        updateMessage(sessionId, assistantId, {
          content: reply,
          status: 'done',
          mode,
          followUps: [
            'Tampilkan contoh bukti dengan skor kredibilitas',
            'Apa perbedaan mode Dasar dan Mendalam?',
          ],
        })
      } catch (err) {
        if (err?.name === 'AbortError') {
          updateMessage(sessionId, assistantId, (msg) => ({
            ...msg,
            status: 'stopped',
          }))
        } else {
          updateMessage(sessionId, assistantId, {
            status: 'error',
            errorMessage: 'Tidak dapat memproses pertanyaan saat ini.',
          })
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null
        }
        setIsGenerating(false)
      }
    },
    [abortControllerRef, setIsGenerating, updateMessage],
  )

  const handleSend = useCallback(
    (text) => {
      if (!activeSession || isGenerating) return
      const sessionId = activeSession.id
      const now = new Date().toISOString()

      const userMessage = {
        id: createMessageId('usr'),
        role: 'user',
        content: text,
        timestamp: now,
      }

      const assistantMessage = {
        id: createMessageId('ast'),
        role: 'assistant',
        content: '',
        status: 'verifying',
        mode: verificationMode,
        timestamp: now,
        feedback: null,
        claims: [],
        followUps: [],
      }

      appendMessage(sessionId, userMessage)
      appendMessage(sessionId, assistantMessage)
      runPreviewReply(sessionId, assistantMessage.id, text, verificationMode)
    },
    [
      activeSession,
      appendMessage,
      isGenerating,
      runPreviewReply,
      verificationMode,
    ],
  )

  const handleEditUserMessage = useCallback(
    (messageId, newText) => {
      if (!activeSession || isGenerating) return
      const sessionId = activeSession.id
      truncateFromMessage(sessionId, messageId, true)
      const now = new Date().toISOString()

      const editedUser = {
        id: createMessageId('usr'),
        role: 'user',
        content: newText,
        timestamp: now,
      }
      const assistantMessage = {
        id: createMessageId('ast'),
        role: 'assistant',
        content: '',
        status: 'verifying',
        mode: verificationMode,
        timestamp: now,
        feedback: null,
        claims: [],
        followUps: [],
      }
      appendMessage(sessionId, editedUser)
      appendMessage(sessionId, assistantMessage)
      runPreviewReply(sessionId, assistantMessage.id, newText, verificationMode)
    },
    [
      activeSession,
      appendMessage,
      isGenerating,
      runPreviewReply,
      truncateFromMessage,
      verificationMode,
    ],
  )

  const handleRegenerate = useCallback(
    (assistantMessageId) => {
      if (!activeSession || isGenerating) return
      const idx = activeSession.messages.findIndex(
        (m) => m.id === assistantMessageId,
      )
      if (idx <= 0) return

      let precedingUser = null
      for (let i = idx - 1; i >= 0; i -= 1) {
        if (activeSession.messages[i].role === 'user') {
          precedingUser = activeSession.messages[i]
          break
        }
      }
      if (!precedingUser) return

      updateMessage(activeSession.id, assistantMessageId, {
        content: '',
        status: 'verifying',
        mode: verificationMode,
        claims: [],
        followUps: [],
        feedback: null,
        errorMessage: null,
        timestamp: new Date().toISOString(),
      })

      runPreviewReply(
        activeSession.id,
        assistantMessageId,
        precedingUser.content,
        verificationMode,
      )
    },
    [
      activeSession,
      isGenerating,
      runPreviewReply,
      updateMessage,
      verificationMode,
    ],
  )

  const messages = activeSession?.messages || []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {messages.length === 0 ? (
        <WelcomeScreen onSelectPrompt={handleSend} />
      ) : (
        <MessageList
          messages={messages}
          isGenerating={isGenerating}
          onCopy={() => showToast('Teks berhasil disalin', 'success')}
          onEditUserMessage={handleEditUserMessage}
          onRegenerate={handleRegenerate}
          onRetry={handleRegenerate}
          onFeedback={(messageId, fb) => {
            if (!activeSession) return
            setMessageFeedback(activeSession.id, messageId, fb)
          }}
          onSelectFollowUp={handleSend}
        />
      )}

      <ChatComposer
        onSend={handleSend}
        onStop={stopGeneration}
        isGenerating={isGenerating}
        verificationMode={verificationMode}
        onChangeMode={setVerificationMode}
      />
    </div>
  )
}
