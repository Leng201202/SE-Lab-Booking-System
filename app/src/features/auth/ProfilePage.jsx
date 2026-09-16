import { Building2, Mail, RotateCcw, UserRound } from 'lucide-react'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { roleLabels } from '../../data/mockUsers'

export function ProfilePage() {
  const { user, resetDemo } = useApp()
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Demo account" title="Profile" description="This identity is provided only for testing the Phase 1 frontend workflow." />
      <Card className="max-w-3xl overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-r from-mfu-700 to-mfu-900 px-4 py-6 text-white sm:px-6 sm:py-8">
          <div className="brand-stripe absolute inset-x-0 top-0 h-1" aria-hidden="true" />
          <div className="grid size-16 place-items-center rounded-2xl bg-white/15 text-xl font-bold">{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
          <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
          <p className="mt-1 text-sm text-emerald-100/75">{roleLabels[user.role]} demo account</p>
        </div>
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
          <div className="flex min-w-0 gap-3"><UserRound className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">Account ID</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.studentId || user.id}</p></div></div>
          <div className="flex min-w-0 gap-3"><Mail className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">Email</p><p className="mt-1 break-all text-sm font-semibold text-slate-800">{user.email}</p></div></div>
          <div className="flex min-w-0 gap-3 sm:col-span-2"><Building2 className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">School / Advisor</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.department || `Advisor: ${user.advisor}`}</p></div></div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 sm:px-6"><Button className="w-full sm:w-auto" variant="secondary" onClick={resetDemo}><RotateCcw size={16} />Restore seeded demo data</Button></div>
      </Card>
    </div>
  )
}
