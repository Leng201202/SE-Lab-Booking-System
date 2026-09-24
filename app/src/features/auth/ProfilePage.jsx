import { Building2, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useApp } from '../../app/AppContext'
import { Card, PageHeader } from '../../components/ui/Card'
import { useLanguage } from '../../i18n/LanguageContext'
import { translatedRoleLabel } from './roles'

export function ProfilePage() {
  const { user } = useApp()
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('profile.eyebrow')} title={t('nav.profile')} description={t('profile.description')} />
      <Card className="max-w-3xl overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-r from-mfu-700 to-mfu-900 px-4 py-6 text-white sm:px-6 sm:py-8">
          <div className="brand-stripe absolute inset-x-0 top-0 h-1" aria-hidden="true" />
          <div className="grid size-16 place-items-center rounded-2xl bg-white/15 text-xl font-bold">{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
          <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
          <p className="mt-1 text-sm text-emerald-100/75">{t('profile.roleAccount', { role: translatedRoleLabel(t, user.role) })}</p>
        </div>
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
          <div className="flex min-w-0 gap-3"><UserRound className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">{t('profile.accountId')}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.studentId || user.id}</p></div></div>
          <div className="flex min-w-0 gap-3"><Mail className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">{t('common.email')}</p><p className="mt-1 break-all text-sm font-semibold text-slate-800">{user.email}</p></div></div>
          <div className="flex min-w-0 gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">{t('common.role')}</p><p className="mt-1 text-sm font-semibold text-slate-800">{translatedRoleLabel(t, user.role)}</p></div></div>
          <div className="flex min-w-0 gap-3"><Building2 className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">{t('profile.schoolAdvisor')}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.role === 'student' ? (user.advisor ? t('profile.advisorNamed', { name: user.advisor }) : t('profile.advisorNotAssigned')) : user.department}</p></div></div>
        </div>
      </Card>
    </div>
  )
}
