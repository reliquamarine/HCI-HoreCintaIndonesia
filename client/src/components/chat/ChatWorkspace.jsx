import { useCallback, useRef, useState } from 'react'
import { useChat } from '../../hooks/useChat.js'
import {
  sendChatMessage,
  upgradeVerificationMode,
} from '../../services/chatService.js'
import { ClaimsOverview } from '../claims/ClaimsOverview.jsx'
import { ChatComposer } from './ChatComposer.jsx'
import { CitedMarkdownRenderer } from './CitedMarkdownRenderer.jsx'
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

  const [selectedClaims, setSelectedClaims] = useState({})
  const [flashingClaim, setFlashingClaim] = useState(null)
  const [upgradingMessageId, setUpgradingMessageId] = useState(null)
  const flashTimerRef = useRef(null)

  const handleJumpToClaim = useCallback((messageId, claimIndex, openPanel) => {
    openPanel?.()
    setSelectedClaims((prev) => ({ ...prev, [messageId]: claimIndex }))
    setFlashingClaim({ messageId, claimIndex })

    if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
    flashTimerRef.current = setTimeout(() => {
      setFlashingClaim(null)
    }, 900)

    setTimeout(() => {
      const panelEl = document.getElementById(`claims-panel-${messageId}`)
      panelEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 60)
  }, [])

  const runAssistantResponse = useCallback(
    async (sessionId, assistantId, query, history, mode) => {
      const controller = new AbortController()
      abortControllerRef.current = controller
      setIsGenerating(true)

      try {
        const result = await sendChatMessage({
          query,
          sessionId,
          history,
          mode,
          signal: controller.signal,
          onPhaseChange: (phase) => {
            updateMessage(sessionId, assistantId, { status: phase })
          },
          onToken: (partialText) => {
            updateMessage(sessionId, assistantId, {
              content: partialText,
              status: 'streaming',
            })
          },
        })

        updateMessage(sessionId, assistantId, {
          content: result.content,
          claims: result.claims,
          followUps: result.followUps,
          mode: result.mode,
          status: 'done',
          errorMessage: null,
        })

        if (result.claims?.length > 0) {
          setSelectedClaims((prev) => ({
            ...prev,
            [assistantId]: result.claims[0].index,
          }))
        }
      } catch (err) {
        if (err?.name === 'AbortError') {
          updateMessage(sessionId, assistantId, (msg) => ({
            ...msg,
            status: 'stopped',
          }))
        } else {
          updateMessage(sessionId, assistantId, {
            status: 'error',
            errorMessage:
              err?.message ||
              'Terjadi kendala saat menelusuri sumber referensi. Silakan coba lagi.',
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

      const history = activeSession.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

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
      runAssistantResponse(
        sessionId,
        assistantMessage.id,
        text,
        history,
        verificationMode,
      )
    },
    [
      activeSession,
      appendMessage,
      isGenerating,
      runAssistantResponse,
      verificationMode,
    ],
  )

  const handleEditUserMessage = useCallback(
    (messageId, newText) => {
      if (!activeSession || isGenerating) return
      const sessionId = activeSession.id
      const targetIdx = activeSession.messages.findIndex(
        (m) => m.id === messageId,
      )
      const historyBefore = activeSession.messages
        .slice(0, Math.max(0, targetIdx))
        .map((m) => ({ role: m.role, content: m.content }))

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
      runAssistantResponse(
        sessionId,
        assistantMessage.id,
        newText,
        historyBefore,
        verificationMode,
      )
    },
    [
      activeSession,
      appendMessage,
      isGenerating,
      runAssistantResponse,
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

      let userIdx = -1
      for (let i = idx - 1; i >= 0; i -= 1) {
        if (activeSession.messages[i].role === 'user') {
          userIdx = i
          break
        }
      }
      if (userIdx === -1) return

      const precedingUser = activeSession.messages[userIdx]
      const historyBefore = activeSession.messages
        .slice(0, userIdx)
        .map((m) => ({ role: m.role, content: m.content }))

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

      runAssistantResponse(
        activeSession.id,
        assistantMessageId,
        precedingUser.content,
        historyBefore,
        verificationMode,
      )
    },
    [
      activeSession,
      isGenerating,
      runAssistantResponse,
      updateMessage,
      verificationMode,
    ],
  )

  const handleUpgradeMode = useCallback(
    async (messageId) => {
      if (!activeSession || upgradingMessageId) return
      setUpgradingMessageId(messageId)
      try {
        const nextMode = await upgradeVerificationMode()
        updateMessage(activeSession.id, messageId, { mode: nextMode })
        showToast('Berhasil beralih ke Mode Mendalam', 'success')
      } finally {
        setUpgradingMessageId(null)
      }
    },
    [activeSession, showToast, updateMessage, upgradingMessageId],
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
          renderMarkdown={(message, { onOpenClaims }) => (
            <CitedMarkdownRenderer
              content={message.content}
              claims={message.claims}
              onSelectClaim={(claimIndex) =>
                handleJumpToClaim(message.id, claimIndex, onOpenClaims)
              }
            />
          )}
          renderClaimsPanel={(message, { onClosePanel }) => (
            <ClaimsOverview
              panelId={`claims-panel-${message.id}`}
              claims={message.claims}
              mode={message.mode}
              selectedClaimIndex={
                selectedClaims[message.id] ?? message.claims?.[0]?.index ?? 1
              }
              flashingClaimIndex={
                flashingClaim?.messageId === message.id
                  ? flashingClaim.claimIndex
                  : null
              }
              onSelectClaim={(claimIndex) =>
                setSelectedClaims((prev) => ({
                  ...prev,
                  [message.id]: claimIndex,
                }))
              }
              isUpgrading={upgradingMessageId === message.id}
              onUpgradeMode={() => handleUpgradeMode(message.id)}
              onClosePanel={onClosePanel}
            />
          )}
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
