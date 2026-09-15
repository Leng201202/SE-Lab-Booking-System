import { CheckCircle2, CircleSlash2, Clock3, XCircle } from 'lucide-react'
import { statusMeta } from '../../utils/booking'

const tones = {
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
}

const icons = {
  approved: CheckCircle2,
  completed: CheckCircle2,
  rejected: XCircle,
  cancelled: CircleSlash2,
}

export function StatusBadge({ status }) {
  const meta = statusMeta[status] || { label: status, tone: 'slate' }
  const Icon = icons[status] || Clock3
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[meta.tone]}`}>
      <Icon size={13} />
      {meta.label}
    </span>
  )
}

export function Badge({ children, tone = 'slate' }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}>{children}</span>
}
