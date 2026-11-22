import { AlertCircle, Check, Copy, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatMessageTime } from '../../utils/dateGroups.js'
import { MODE_META } from '../../utils/verificationLabels.js'
import { BrandLogo } from '../ui/BrandLogo.jsx'
import { MessageActionBar } from './MessageActionBar.jsx'
import { TypingIndicator } from './TypingIndicator.jsx'

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false)
  const rawCode = String(children).replace(/\n$/, '')
  const language = className?.replace('language-', '') || 'kode'

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(rawCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Ignore clipboard failure
    }
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-line bg-surface-muted">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          {language}
        </span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
        >
          {copied ? (
            <>
              <Check
                className="h-3 w-3"
                style={{ color: 'var(--status-supported-text)' }}
              />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Salin kode</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-ink">
        <code>{rawCode}</code>
      </pre>
    </div>
  )
}

export function MessageItem({
  message,
  isGenerating,
  onCopy,
  onEditUserMessage,
  onRegenerate,
  onFeedback,
  onRetry,
  renderMarkdown,
  renderClaimsPanel,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editDraft, setEditDraft] = useState(message.content)
  const [isClaimsOpen, setIsClaimsOpen] = useState(true)

  const timeText = formatMessageTime(message.timestamp)

  if (message.role === 'user') {
    function handleSaveEdit() {
      const trimmed = editDraft.trim()
      if (!trimmed) return
      setIsEditing(false)
      onEditUserMessage?.(message.id, trimmed)
    }

    return (
      <article className="group flex flex-col items-end animate-fade-up">
        {isEditing ? (
          <div className="w-full max-w-2xl rounded-2xl border border-brand bg-surface p-3 shadow-[var(--shadow-card)]">
            <textarea
              rows={3}
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              aria-label="Ubah teks pertanyaan"
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-ink focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setEditDraft(message.content)
                }}
                className="rounded-xl border border-line px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-surface-hover hover:text-ink"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editDraft.trim()}
                className="rounded-xl bg-brand px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
              >
                Simpan dan Kirim
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-[88%] sm:max-w-[78%]">
            <div className="rounded-2xl rounded-tr-md border border-user-bubble-border bg-user-bubble px-4 py-3 text-sm leading-relaxed text-ink sm:text-[15px]">
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            <div className="mt-1 flex items-center justify-end gap-2 px-1">
              {timeText && (
                <time className="text-[11px] text-ink-muted">{timeText}</time>
              )}
            </div>
            <MessageActionBar
              role="user"
              content={message.content}
              onCopy={onCopy}
              onEdit={
                onEditUserMessage
                  ? () => {
                      setEditDraft(message.content)
                      setIsEditing(true)
                    }
                  : undefined
              }
              disabled={isGenerating}
            />
          </div>
        )}
      </article>
    )
  }

  const modeLabel = (MODE_META[message.mode] || MODE_META.basic).badgeLabel
  const claimsCount = Array.isArray(message.claims) ? message.claims.length : 0
  const isWaiting =
    (message.status === 'verifying' || message.status === 'streaming') &&
    !message.content

  return (
    <article className="flex items-start gap-3 sm:gap-3.5 animate-fade-up">
      <BrandLogo className="mt-0.5 h-8 w-8 shadow-xs" />

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink">FritoGrafi</span>
          {message.mode && (
            <span className="rounded-full border border-line bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
              {modeLabel}
            </span>
          )}
          {timeText && (
            <time className="text-[11px] text-ink-muted">{timeText}</time>
          )}
        </div>

        {isWaiting ? (
          <TypingIndicator phase={message.status} />
        ) : message.status === 'error' ? (
          <div
            className="rounded-2xl border p-4"
            style={{
              backgroundColor: 'var(--status-contradicted-bg)',
              borderColor: 'var(--status-contradicted-border)',
              color: 'var(--status-contradicted-text)',
            }}
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  Gagal memproses jawaban
                </p>
                <p className="mt-1 text-xs leading-relaxed opacity-90">
                  {message.errorMessage ||
                    'Terjadi kendala saat menelusuri sumber referensi. Silakan coba lagi.'}
                </p>
                {onRetry && (
                  <button
                    type="button"
                    onClick={() => onRetry(message.id)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-xs transition-colors hover:bg-surface-hover"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Coba Lagi</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="chat-prose max-w-3xl break-words">
              {renderMarkdown ? (
                renderMarkdown(message, {
                  onOpenClaims: () => setIsClaimsOpen(true),
                })
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre({ children }) {
                      return <>{children}</>
                    },
                    code({ className, children, ...props }) {
                      const isBlock = Boolean(className) || String(children).includes('\n')
                      if (isBlock) {
                        return (
                          <CodeBlock className={className}>{children}</CodeBlock>
                        )
                      }
                      return (
                        <code
                          className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em] text-ink"
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      )
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>

            {message.status === 'streaming' && (
              <div className="mt-2">
                <TypingIndicator phase="streaming" />
              </div>
            )}

            {message.status === 'stopped' && (
              <p className="mt-2 inline-flex rounded-lg border border-line bg-surface-muted px-2.5 py-1 text-xs text-ink-secondary">
                Penyusunan jawaban dihentikan oleh pengguna.
              </p>
            )}

            {claimsCount > 0 && isClaimsOpen && renderClaimsPanel && (
              <div className="mt-4">
                {renderClaimsPanel(message, {
                  onClosePanel: () => setIsClaimsOpen(false),
                })}
              </div>
            )}

            {message.status !== 'streaming' && message.status !== 'verifying' && (
              <MessageActionBar
                role="assistant"
                content={message.content}
                feedback={message.feedback}
                claimsCount={claimsCount}
                isClaimsOpen={isClaimsOpen}
                onToggleClaims={
                  claimsCount > 0
                    ? () => setIsClaimsOpen((prev) => !prev)
                    : undefined
                }
                onCopy={onCopy}
                onRegenerate={
                  onRegenerate ? () => onRegenerate(message.id) : undefined
                }
                onFeedback={
                  onFeedback ? (fb) => onFeedback(message.id, fb) : undefined
                }
                disabled={isGenerating}
              />
            )}
          </>
        )}
      </div>
    </article>
  )
}
