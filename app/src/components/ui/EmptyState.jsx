import { Inbox } from 'lucide-react'

export function EmptyState({ title = 'Nothing here yet', description = 'There are no items to display.' }) {
  return (
    <div className="grid min-h-56 place-items-center px-6 text-center">
      <div>
        <span className="mx-auto grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><Inbox size={20} /></span>
        <h3 className="mt-3 font-semibold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

export function LoadingState() {
  return <div className="p-8 text-center text-sm text-slate-500">Loading data…</div>
}
