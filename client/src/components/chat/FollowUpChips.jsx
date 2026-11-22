import { ArrowRight } from 'lucide-react'

export function FollowUpChips({ items, onSelect, disabled = false }) {
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <div className="mt-4 pl-0 sm:pl-11 animate-fade-up">
      <p className="mb-2 text-xs font-semibold text-ink-muted">
        Pertanyaan lanjutan
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((question) => (
          <button
            key={question}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(question)}
            className="group inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-left text-xs font-medium text-ink transition-all hover:border-brand-border hover:bg-surface-hover disabled:opacity-50"
          >
            <span>{question}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
          </button>
        ))}
      </div>
    </div>
  )
}
