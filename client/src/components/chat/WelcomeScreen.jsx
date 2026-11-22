import { ArrowUpRight, FileSearch, Scale, ShieldCheck } from 'lucide-react'
import { STARTER_PROMPTS } from '../../data/starterPrompts.js'
import { BrandLogo } from '../ui/BrandLogo.jsx'

const HIGHLIGHTS = [
  {
    id: 'claims',
    icon: ShieldCheck,
    label: 'Verifikasi per Klaim',
  },
  {
    id: 'score',
    icon: Scale,
    label: 'Skor Keyakinan & Kredibilitas',
  },
  {
    id: 'sources',
    icon: FileSearch,
    label: 'Kutipan Sumber Terbuka',
  },
]

export function WelcomeScreen({ onSelectPrompt }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-3xl animate-fade-up">
        <div className="flex flex-col items-center text-center">
          <BrandLogo className="h-14 w-14 shadow-(--shadow-card)" />

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Halo, apa yang ingin kamu pastikan hari ini?
          </h1>

          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink-secondary sm:text-base">
            Ajukan pertanyaan apa saja. FritoGrafi menyusun jawaban sekaligus memecah setiap klaim penting beserta sumber rujukan yang dapat kamu periksa langsung.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-secondary"
                >
                  <Icon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-9">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-ink-muted sm:text-left">
            Coba tanyakan salah satu topik berikut
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {STARTER_PROMPTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPrompt(item.prompt)}
                className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 text-left shadow-[0_1px_2px_rgba(28,25,23,0.04)] transition-all hover:border-brand-border hover:bg-surface-hover"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                    {item.category}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
                </div>
                <div className="mt-3">
                  <div className="text-sm font-semibold text-ink">
                    {item.title}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-secondary">
                    {item.prompt}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
