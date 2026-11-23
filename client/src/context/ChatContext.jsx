import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { toSerializableAttachment } from '../utils/fileAttachments.js'
import { ChatContext } from './chatContextValue.js'

const SESSIONS_STORAGE_KEY = 'fritografi_sessions_v1'
const MODE_STORAGE_KEY = 'fritografi_mode_v1'

function createId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function buildEmptySession() {
  const now = new Date().toISOString()
  return {
    id: createId('sess'),
    title: 'Percakapan Baru',
    createdAt: now,
    updatedAt: now,
    messages: [],
  }
}

function loadStoredSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && typeof item.id === 'string' && Array.isArray(item.messages))
      .map((session) => ({
        ...session,
        messages: session.messages.map((msg) =>
          msg.status === 'streaming' ||
          msg.status === 'verifying' ||
          msg.status === 'waking_server' ||
          msg.status === 'reading_files'
            ? { ...msg, status: 'stopped' }
            : msg,
        ),
      }))
  } catch {
    return []
  }
}

function loadStoredMode() {
  try {
    const saved = localStorage.getItem(MODE_STORAGE_KEY)
    if (saved === 'basic' || saved === 'comprehensive') {
      return saved
    }
  } catch {
    // Ignore storage errors
  }
  return 'basic'
}

function createInitialState() {
  const stored = loadStoredSessions()
  if (stored.length > 0) {
    const sorted = [...stored].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    let keptEmpty = false
    const deduplicated = sorted.filter((session) => {
      if (session.messages.length === 0) {
        if (keptEmpty) return false
        keptEmpty = true
      }
      return true
    })
    return {
      sessions: deduplicated,
      activeSessionId: deduplicated[0].id,
    }
  }
  const initialSession = buildEmptySession()
  return {
    sessions: [initialSession],
    activeSessionId: initialSession.id,
  }
}

function deriveTitleFromText(text) {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return 'Percakapan Baru'
  return cleaned.length > 48 ? `${cleaned.slice(0, 48).trimEnd()}...` : cleaned
}

function chatReducer(state, action) {
  switch (action.type) {
    case 'CREATE_SESSION': {
      const existingEmpty = state.sessions.find((s) => s.messages.length === 0)
      if (existingEmpty) {
        const now = new Date().toISOString()
        const refreshed = { ...existingEmpty, updatedAt: now }
        const others = state.sessions.filter((s) => s.id !== existingEmpty.id)
        return {
          ...state,
          sessions: [refreshed, ...others],
          activeSessionId: existingEmpty.id,
        }
      }
      const next = action.payload || buildEmptySession()
      return {
        ...state,
        sessions: [next, ...state.sessions],
        activeSessionId: next.id,
      }
    }

    case 'SELECT_SESSION': {
      if (!state.sessions.some((s) => s.id === action.payload)) {
        return state
      }
      return {
        ...state,
        activeSessionId: action.payload,
      }
    }

    case 'RENAME_SESSION': {
      const { sessionId, title } = action.payload
      const trimmed = title.trim()
      if (!trimmed) return state
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === sessionId
            ? { ...session, title: trimmed, updatedAt: new Date().toISOString() }
            : session,
        ),
      }
    }

    case 'DELETE_SESSION': {
      const remaining = state.sessions.filter((s) => s.id !== action.payload)
      if (remaining.length === 0) {
        const fresh = buildEmptySession()
        return {
          sessions: [fresh],
          activeSessionId: fresh.id,
        }
      }
      const nextActive =
        state.activeSessionId === action.payload
          ? remaining[0].id
          : state.activeSessionId
      return {
        sessions: remaining,
        activeSessionId: nextActive,
      }
    }

    case 'CLEAR_ALL_SESSIONS': {
      const fresh = buildEmptySession()
      return {
        sessions: [fresh],
        activeSessionId: fresh.id,
      }
    }

    case 'APPEND_MESSAGE': {
      const { sessionId, message } = action.payload
      const now = new Date().toISOString()
      return {
        ...state,
        sessions: state.sessions.map((session) => {
          if (session.id !== sessionId) return session
          const isFirstUserMsg =
            session.messages.length === 0 && message.role === 'user'
          const titleSource =
            message.isDefaultPrompt && message.attachments?.length > 0
              ? `Analisis ${message.attachments[0].name}`
              : message.content
          const nextTitle =
            isFirstUserMsg && session.title === 'Percakapan Baru'
              ? deriveTitleFromText(titleSource)
              : session.title
          return {
            ...session,
            title: nextTitle,
            updatedAt: now,
            messages: [...session.messages, message],
          }
        }),
      }
    }

    case 'UPDATE_MESSAGE': {
      const { sessionId, messageId, updater } = action.payload
      return {
        ...state,
        sessions: state.sessions.map((session) => {
          if (session.id !== sessionId) return session
          return {
            ...session,
            updatedAt: new Date().toISOString(),
            messages: session.messages.map((msg) => {
              if (msg.id !== messageId) return msg
              return typeof updater === 'function' ? updater(msg) : { ...msg, ...updater }
            }),
          }
        }),
      }
    }

    case 'TRUNCATE_FROM_MESSAGE': {
      const { sessionId, messageId, includeTarget } = action.payload
      return {
        ...state,
        sessions: state.sessions.map((session) => {
          if (session.id !== sessionId) return session
          const idx = session.messages.findIndex((m) => m.id === messageId)
          if (idx === -1) return session
          const nextMessages = includeTarget
            ? session.messages.slice(0, idx)
            : session.messages.slice(0, idx + 1)
          return {
            ...session,
            updatedAt: new Date().toISOString(),
            messages: nextMessages,
          }
        }),
      }
    }

    default:
      return state
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, createInitialState)
  const [verificationMode, setVerificationModeState] = useState(loadStoredMode)
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast, setToast] = useState(null)

  const abortControllerRef = useRef(null)
  const toastTimerRef = useRef(null)

  useEffect(() => {
    try {
      const sanitized = state.sessions.map((session) => ({
        ...session,
        messages: session.messages.map((msg) =>
          Array.isArray(msg.attachments) && msg.attachments.length > 0
            ? {
                ...msg,
                attachments: msg.attachments.map(toSerializableAttachment),
              }
            : msg,
        ),
      }))
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sanitized))
    } catch {
      // Ignore storage quota errors
    }
  }, [state.sessions])

  const setVerificationMode = useCallback((mode) => {
    if (mode !== 'basic' && mode !== 'comprehensive') return
    setVerificationModeState(mode)
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode)
    } catch {
      // Ignore storage errors
    }
  }, [])

  const showToast = useCallback((message, variant = 'default') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    setToast({ id: Date.now(), message, variant })
    toastTimerRef.current = setTimeout(() => {
      setToast(null)
    }, 2800)
  }, [])

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    setToast(null)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsGenerating(false)
  }, [])

  const createNewSession = useCallback(() => {
    stopGeneration()
    const fresh = buildEmptySession()
    dispatch({ type: 'CREATE_SESSION', payload: fresh })
    return fresh.id
  }, [stopGeneration])

  const selectSession = useCallback(
    (sessionId) => {
      stopGeneration()
      dispatch({ type: 'SELECT_SESSION', payload: sessionId })
    },
    [stopGeneration],
  )

  const renameSession = useCallback(
    (sessionId, title) => {
      dispatch({ type: 'RENAME_SESSION', payload: { sessionId, title } })
      showToast('Judul percakapan diperbarui')
    },
    [showToast],
  )

  const deleteSession = useCallback(
    (sessionId) => {
      stopGeneration()
      dispatch({ type: 'DELETE_SESSION', payload: sessionId })
      showToast('Percakapan dihapus')
    },
    [showToast, stopGeneration],
  )

  const clearAllSessions = useCallback(() => {
    stopGeneration()
    dispatch({ type: 'CLEAR_ALL_SESSIONS' })
    showToast('Seluruh riwayat percakapan dibersihkan')
  }, [showToast, stopGeneration])

  const appendMessage = useCallback((sessionId, message) => {
    dispatch({ type: 'APPEND_MESSAGE', payload: { sessionId, message } })
  }, [])

  const updateMessage = useCallback((sessionId, messageId, updater) => {
    dispatch({
      type: 'UPDATE_MESSAGE',
      payload: { sessionId, messageId, updater },
    })
  }, [])

  const truncateFromMessage = useCallback(
    (sessionId, messageId, includeTarget = true) => {
      dispatch({
        type: 'TRUNCATE_FROM_MESSAGE',
        payload: { sessionId, messageId, includeTarget },
      })
    },
    [],
  )

  const setMessageFeedback = useCallback(
    (sessionId, messageId, feedback) => {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          sessionId,
          messageId,
          updater: (msg) => ({
            ...msg,
            feedback: msg.feedback === feedback ? null : feedback,
          }),
        },
      })
    },
    [],
  )

  const activeSession = useMemo(() => {
    return (
      state.sessions.find((s) => s.id === state.activeSessionId) ||
      state.sessions[0]
    )
  }, [state.sessions, state.activeSessionId])

  const value = useMemo(
    () => ({
      sessions: state.sessions,
      activeSessionId: activeSession?.id || null,
      activeSession,
      verificationMode,
      setVerificationMode,
      isGenerating,
      setIsGenerating,
      abortControllerRef,
      stopGeneration,
      createNewSession,
      selectSession,
      renameSession,
      deleteSession,
      clearAllSessions,
      appendMessage,
      updateMessage,
      truncateFromMessage,
      setMessageFeedback,
      toast,
      showToast,
      dismissToast,
    }),
    [
      state.sessions,
      activeSession,
      verificationMode,
      setVerificationMode,
      isGenerating,
      stopGeneration,
      createNewSession,
      selectSession,
      renameSession,
      deleteSession,
      clearAllSessions,
      appendMessage,
      updateMessage,
      truncateFromMessage,
      setMessageFeedback,
      toast,
      showToast,
      dismissToast,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
