import { ArrowRight, GraduationCap, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { demoUsers, roleLabels } from '../../data/mockUsers'

const roleDetails = {
  student: { icon: GraduationCap, description: 'Request a lab PC and follow approval progress.', accent: 'bg-mfu-500/15 text-emerald-200', hover: 'hover:border-mfu-400/60', link: 'text-emerald-300' },
  advisor: { icon: UserRoundCheck, description: 'Review student requests before dean approval.', accent: 'bg-blue-500/15 text-blue-200', hover: 'hover:border-blue-400/60', link: 'text-blue-300' },
  dean: { icon: ShieldCheck, description: 'Give final approval to reviewed bookings.', accent: 'bg-amber-400/15 text-amber-200', hover: 'hover:border-amber-300/60', link: 'text-amber-300' },
}

export function LoginPage() {
  const { selectRole } = useApp()
  const navigate = useNavigate()

  const login = (role) => {
    selectRole(role)
    navigate('/dashboard')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-mfu-950 px-5 py-10 text-white">
      <div className="brand-stripe absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-24 size-96 rounded-full bg-mfu-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-blue-600/12 blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-white p-2 shadow-xl shadow-black/30"><img src="/SE_Logo.png" alt="Software Engineering logo" className="h-full w-auto object-contain" /></div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Mae Fah Luang University · ADT</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">SE Lab PC Booking System</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-emerald-100/60">Choose a demo role to explore the complete student request and university approval workflow.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(roleDetails).map(([role, detail]) => {
            const Icon = detail.icon
            const user = demoUsers[role]
            return (
              <button key={role} onClick={() => login(role)} className={`group rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-left shadow-2xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.09] ${detail.hover}`}>
                <span className={`grid size-11 place-items-center rounded-xl ${detail.accent}`}><Icon size={22} /></span>
                <h2 className="mt-5 text-lg font-bold">Continue as {roleLabels[role]}</h2>
                <p className="mt-1 text-sm font-medium text-slate-300">{user.shortName || user.name}</p>
                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">{detail.description}</p>
                <span className={`mt-5 flex items-center gap-2 text-sm font-semibold ${detail.link}`}>Enter dashboard <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
              </button>
            )
          })}
        </div>
        <p className="mt-8 text-center text-xs text-slate-600">Demo data is stored only in this browser. No real account or backend is connected.</p>
      </div>
    </main>
  )
}
