import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  MinusCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '../../utils/cn.js'
import {
  getStanceMeta,
  getVerdictMeta,
} from '../../utils/verificationLabels.js'

const VERDICT_ICONS = {
  SUPPORTED: CheckCircle2,
  PARTIAL: AlertTriangle,
  CONTRADICTED: XCircle,
  UNVERIFIED: HelpCircle,
}

const STANCE_ICONS = {
  SUPPORTS: CheckCircle2,
  NEUTRAL: MinusCircle,
  CONTRADICTS: XCircle,
}

export function VerdictBadge({ verdict, compact = false, className }) {
  const meta = getVerdictMeta(verdict)
  const Icon = VERDICT_ICONS[verdict] || HelpCircle

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-semibold tracking-tight',
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
        className,
      )}
      style={{
        backgroundColor: meta.bgVar,
        color: meta.textVar,
        borderColor: meta.borderVar,
      }}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{compact ? meta.shortLabel : meta.label}</span>
    </span>
  )
}

export function StanceBadge({ stance, className }) {
  const meta = getStanceMeta(stance)
  const Icon = STANCE_ICONS[stance] || MinusCircle

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        className,
      )}
      style={{
        backgroundColor: meta.bgVar,
        color: meta.textVar,
        borderColor: meta.borderVar,
      }}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  )
}
