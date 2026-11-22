import { Check, Copy } from 'lucide-react'
import { Children, cloneElement, isValidElement, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { InlineClaimBadge } from '../claims/InlineClaimBadge.jsx'

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

function injectClaimBadges(children, claimMap, onSelectClaim) {
  if (!claimMap || claimMap.size === 0) return children

  return Children.map(children, (child, idx) => {
    if (typeof child === 'string') {
      const parts = child.split(/(\[\d+\])/g)
      if (parts.length === 1) return child

      return parts.map((part, partIdx) => {
        const match = part.match(/^\[(\d+)\]$/)
        if (!match) return part
        const claimIndex = Number(match[1])
        const claim = claimMap.get(claimIndex)
        if (!claim) return part
        return (
          <InlineClaimBadge
            key={`cite_${idx}_${partIdx}_${claimIndex}`}
            claim={claim}
            onSelect={onSelectClaim}
          />
        )
      })
    }

    if (isValidElement(child)) {
      if (
        child.type === 'code' ||
        child.type === 'pre' ||
        child.type === 'a'
      ) {
        return child
      }
      if (child.props && child.props.children) {
        return cloneElement(child, {
          ...child.props,
          children: injectClaimBadges(
            child.props.children,
            claimMap,
            onSelectClaim,
          ),
        })
      }
    }

    return child
  })
}

export function CitedMarkdownRenderer({ content, claims, onSelectClaim }) {
  const claimMap = new Map()
  if (Array.isArray(claims)) {
    for (const claim of claims) {
      claimMap.set(claim.index, claim)
    }
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p({ children }) {
          return <p>{injectClaimBadges(children, claimMap, onSelectClaim)}</p>
        },
        li({ children }) {
          return <li>{injectClaimBadges(children, claimMap, onSelectClaim)}</li>
        },
        blockquote({ children }) {
          return (
            <blockquote>
              {injectClaimBadges(children, claimMap, onSelectClaim)}
            </blockquote>
          )
        },
        table({ children }) {
          return (
            <div className="my-3 w-full overflow-x-auto rounded-xl border border-line">
              <table className="my-0!">{children}</table>
            </div>
          )
        },
        td({ children }) {
          return <td>{injectClaimBadges(children, claimMap, onSelectClaim)}</td>
        },
        pre({ children }) {
          return <>{children}</>
        },
        code({ className, children, ...props }) {
          const isBlock =
            Boolean(className) || String(children).includes('\n')
          if (isBlock) {
            return <CodeBlock className={className}>{children}</CodeBlock>
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
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
