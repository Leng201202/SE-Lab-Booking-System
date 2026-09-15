export function Card({ className = '', children }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] ${className}`}>
      {children}
    </div>
  )
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-mfu-700">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, tone = 'blue', detail }) {
  const tones = {
    blue: 'bg-mfu-50 text-mfu-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  }
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          {detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}
        </div>
        <span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={19} strokeWidth={2} />
        </span>
      </div>
    </Card>
  )
}
