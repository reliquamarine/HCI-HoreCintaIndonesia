import { useCallback, useEffect, useRef, useState } from 'react'
import { useChat } from '../../hooks/useChat.js'
import {
  sendChatMessage,
  upgradeVerificationMode,
} from '../../services/chatService.js'
import {
  DEFAULT_ATTACHMENT_PROMPT,
  prepareAttachmentItem,
  toSerializableAttachment,
  validateIncomingFiles,
} from '../../utils/fileAttachments.js'
import { ClaimsOverview } from '../claims/ClaimsOverview.jsx'
import { ChatComposer } from './ChatComposer.jsx'
import { CitedMarkdownRenderer } from './CitedMarkdownRenderer.jsx'
import { DropzoneOverlay } from './DropzoneOverlay.jsx'
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
  const [pendingAttachments, setPendingAttachments] = useState([])
  const [runtimeAttachments, setRuntimeAttachments] = useState({})
  const [isDraggingFiles, setIsDraggingFiles] = useState(false)

  const flashTimerRef = useRef(null)
  const dragCounterRef = useRef(0)
  const blobUrlsRef = useRef(new Set())

  useEffect(() => {
    const trackedUrls = blobUrlsRef.current
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current)
      for (const url of trackedUrls) {
        URL.revokeObjectURL(url)
      }
      trackedUrls.clear()
    }
  }, [])

  const handleAddFiles = useCallback(
    async (fileList) => {
      if (isGenerating) return
      const { accepted, errors } = validateIncomingFiles(
        fileList,
        pendingAttachments,
      )

      if (errors.length > 0) {
        showToast(errors[0])
      }

      if (accepted.length === 0) return

      const prepared = await Promise.all(
        accepted.map((file) => prepareAttachmentItem(file)),
      )

      for (const item of prepared) {
        if (item.previewUrl) {
          blobUrlsRef.current.add(item.previewUrl)
        }
      }

      setPendingAttachments((prev) => [...prev, ...prepared])
    },
    [isGenerating, pendingAttachments, showToast],
  )

  const handleRemoveAttachment = useCallback((attachmentId) => {
    setPendingAttachments((prev) => {
      const target = prev.find((item) => item.id === attachmentId)
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl)
        blobUrlsRef.current.delete(target.previewUrl)
      }
      return prev.filter((item) => item.id !== attachmentId)
    })
  }, [])

  const handleDragEnter = useCallback(
    (event) => {
      if (isGenerating) return
      if (!event.dataTransfer?.types?.includes('Files')) return
      event.preventDefault()
      dragCounterRef.current += 1
      setIsDraggingFiles(true)
    },
    [isGenerating],
  )

  const handleDragOver = useCallback(
    (event) => {
      if (isGenerating) return
      if (!event.dataTransfer?.types?.includes('Files')) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    },
    [isGenerating],
  )

  const handleDragLeave = useCallback((event) => {
    if (!event.dataTransfer?.types?.includes('Files')) return
    event.preventDefault()
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)
    if (dragCounterRef.current === 0) {
      setIsDraggingFiles(false)
    }
  }, [])

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault()
      dragCounterRef.current = 0
      setIsDraggingFiles(false)
      if (isGenerating) return
      if (event.dataTransfer?.files?.length) {
        handleAddFiles(event.dataTransfer.files)
      }
    },
    [handleAddFiles, isGenerating],
  )

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
    async ({
      sessionId,
      assistantId,
      query,
      history,
      mode,
      attachments = [],
      files = [],
    }) => {
      const controller = new AbortController()
      abortControllerRef.current = controller
      setIsGenerating(true)

      try {
        const result = await sendChatMessage({
          query,
          sessionId,
          history,
          mode,
          attachments,
          files,
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
    (rawText) => {
      if (!activeSession || isGenerating) return
      const trimmedText = (rawText || '').trim()
      const currentPending = pendingAttachments

      if (!trimmedText && currentPending.length === 0) return

      const sessionId = activeSession.id
      const now = new Date().toISOString()
      const isDefaultPrompt = !trimmedText && currentPending.length > 0
      const finalPrompt = trimmedText || DEFAULT_ATTACHMENT_PROMPT

      const serializableAttachments = currentPending.map(
        toSerializableAttachment,
      )
      const filesToSend = currentPending
        .map((item) => item.file)
        .filter(Boolean)

      if (currentPending.length > 0) {
        setRuntimeAttachments((prev) => {
          const next = { ...prev }
          for (const item of currentPending) {
            next[item.id] = {
              file: item.file,
              previewUrl: item.previewUrl,
            }
          }
          return next
        })
        setPendingAttachments([])
      }

      const history = activeSession.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const userMessage = {
        id: createMessageId('usr'),
        role: 'user',
        content: finalPrompt,
        isDefaultPrompt,
        attachments: serializableAttachments,
        timestamp: now,
      }

      const assistantMessage = {
        id: createMessageId('ast'),
        role: 'assistant',
        content: '',
        status: serializableAttachments.length > 0 ? 'reading_files' : 'verifying',
        mode: verificationMode,
        timestamp: now,
        feedback: null,
        claims: [],
        followUps: [],
      }

      appendMessage(sessionId, userMessage)
      appendMessage(sessionId, assistantMessage)
      runAssistantResponse({
        sessionId,
        assistantId: assistantMessage.id,
        query: finalPrompt,
        history,
        mode: verificationMode,
        attachments: serializableAttachments,
        files: filesToSend,
      })
    },
    [
      activeSession,
      appendMessage,
      isGenerating,
      pendingAttachments,
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
      const originalMessage = activeSession.messages[targetIdx]
      const preservedAttachments = Array.isArray(originalMessage?.attachments)
        ? originalMessage.attachments
        : []
      const preservedFiles = preservedAttachments
        .map((att) => runtimeAttachments[att.id]?.file)
        .filter(Boolean)

      const historyBefore = activeSession.messages
        .slice(0, Math.max(0, targetIdx))
        .map((m) => ({ role: m.role, content: m.content }))

      truncateFromMessage(sessionId, messageId, true)
      const now = new Date().toISOString()

      const editedUser = {
        id: createMessageId('usr'),
        role: 'user',
        content: newText,
        attachments: preservedAttachments,
        timestamp: now,
      }

      const assistantMessage = {
        id: createMessageId('ast'),
        role: 'assistant',
        content: '',
        status: preservedAttachments.length > 0 ? 'reading_files' : 'verifying',
        mode: verificationMode,
        timestamp: now,
        feedback: null,
        claims: [],
        followUps: [],
      }

      appendMessage(sessionId, editedUser)
      appendMessage(sessionId, assistantMessage)
      runAssistantResponse({
        sessionId,
        assistantId: assistantMessage.id,
        query: newText,
        history: historyBefore,
        mode: verificationMode,
        attachments: preservedAttachments,
        files: preservedFiles,
      })
    },
    [
      activeSession,
      appendMessage,
      isGenerating,
      runAssistantResponse,
      runtimeAttachments,
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
      const userAttachments = Array.isArray(precedingUser.attachments)
        ? precedingUser.attachments
        : []
      const userFiles = userAttachments
        .map((att) => runtimeAttachments[att.id]?.file)
        .filter(Boolean)

      const historyBefore = activeSession.messages
        .slice(0, userIdx)
        .map((m) => ({ role: m.role, content: m.content }))

      updateMessage(activeSession.id, assistantMessageId, {
        content: '',
        status: userAttachments.length > 0 ? 'reading_files' : 'verifying',
        mode: verificationMode,
        claims: [],
        followUps: [],
        feedback: null,
        errorMessage: null,
        timestamp: new Date().toISOString(),
      })

      runAssistantResponse({
        sessionId: activeSession.id,
        assistantId: assistantMessageId,
        query: precedingUser.content,
        history: historyBefore,
        mode: verificationMode,
        attachments: userAttachments,
        files: userFiles,
      })
    },
    [
      activeSession,
      isGenerating,
      runAssistantResponse,
      runtimeAttachments,
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
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DropzoneOverlay visible={isDraggingFiles} />

      {messages.length === 0 ? (
        <WelcomeScreen onSelectPrompt={handleSend} />
      ) : (
        <MessageList
          messages={messages}
          runtimeAttachments={runtimeAttachments}
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
        attachments={pendingAttachments}
        onAddFiles={handleAddFiles}
        onRemoveAttachment={handleRemoveAttachment}
      />
    </div>
  )
}
