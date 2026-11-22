import { Search, X } from 'lucide-react'

export function SessionSearch({ value, onChange, inputRef }) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari percakapan..."
        aria-label="Cari riwayat percakapan"
        className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-14 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-brand focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          aria-label="Bersihkan pencarian"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-muted sm:inline-block">
          Ctrl K
        </kbd>
      )}
    </div>
  )
}
