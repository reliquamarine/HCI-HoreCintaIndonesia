import { useCallback, useEffect, useRef, useState } from 'react'

export function useAutoScroll(dependency) {
  const containerRef = useRef(null)
  const bottomRef = useRef(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const isAtBottomRef = useRef(true)

  const checkPosition = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const nearBottom = distanceFromBottom < 96
    isAtBottomRef.current = nearBottom
    setIsAtBottom(nearBottom)
  }, [])

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
    isAtBottomRef.current = true
    setIsAtBottom(true)
  }, [])

  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
    }
  }, [dependency])

  return {
    containerRef,
    bottomRef,
    isAtBottom,
    handleScroll: checkPosition,
    scrollToBottom,
  }
}
