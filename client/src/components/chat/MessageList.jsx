import { ArrowDown } from 'lucide-react'
import { useAutoScroll } from '../../hooks/useAutoScroll.js'
import { FollowUpChips } from './FollowUpChips.jsx'
import { MessageItem } from './MessageItem.jsx'

export function MessageList({
  messages,
  isGenerating,
  onCopy,
  onEditUserMessage,
  onRegenerate,
  onFeedback,
  onRetry,
  onSelectFollowUp,
  renderMarkdown,
  renderClaimsPanel,
}) {
  const lastMessage = messages[messages.length - 1]
  const scrollDep = `${messages.length}_${lastMessage?.content?.length || 0}_${lastMessage?.status || ''}`

  const { containerRef, bottomRef, isAtBottom, handleScroll, scrollToBottom } =
    useAutoScroll(scrollDep)

  const showFollowUps =
    !isGenerating &&
    lastMessage?.role === 'assistant' &&
    lastMessage?.status === 'done' &&
    Array.isArray(lastMessage.followUps) &&
    lastMessage.followUps.length > 0

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-6 sm:px-6"
        role="log"
        aria-live="polite"
        aria-label="Daftar pesan percakapan"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-7 pb-6">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isGenerating={isGenerating}
              onCopy={onCopy}
              onEditUserMessage={onEditUserMessage}
              onRegenerate={onRegenerate}
              onFeedback={onFeedback}
              onRetry={onRetry}
              renderMarkdown={renderMarkdown}
              renderClaimsPanel={renderClaimsPanel}
            />
          ))}

          {showFollowUps && (
            <FollowUpChips
              items={lastMessage.followUps}
              onSelect={onSelectFollowUp}
              disabled={isGenerating}
            />
          )}

          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </div>

      {!isAtBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink shadow-(--shadow-float) transition-colors hover:bg-surface-hover animate-fade-up"
          aria-label="Gulir ke pesan terbaru"
        >
          <ArrowDown className="h-3.5 w-3.5 text-brand" />
          <span>Ke pesan terbaru</span>
        </button>
      )}
    </div>
  )
}
