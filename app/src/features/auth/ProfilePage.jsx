import { Building2, IdCard, Mail, Pencil, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { Field, Input } from '../../components/ui/FormFields'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { useLanguage } from '../../i18n/LanguageContext'
import { translatedRoleLabel } from './roles'

const studentIdErrorKeys = {
  'Authentication is required.': 'profile.authenticationRequired',
  'An application profile is required.': 'profile.applicationProfileRequired',
  'Only Students can update a Student ID.': 'profile.studentOnlyStudentId',
  'Student ID must contain exactly 10 digits.': 'profile.studentIdDigitsError',
  'Your Student ID must match your Lamduan email.': 'profile.studentIdLamduanError',
  'This Student ID is already in use.': 'profile.studentIdInUse',
}

function getLamduanStudentId(email) {
  return /^([0-9]{10})@lamduan\.mfu\.ac\.th$/i.exec(email.trim())?.[1] || null
}

function StudentIdEditor({ onClose }) {
  const { user, updateStudentId } = useApp()
  const { t } = useLanguage()
  const lamduanStudentId = getLamduanStudentId(user.email)
  const [value, setValue] = useState(user.studentId || '')
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const closeEditor = () => {
    if (saving) return
    setConfirming(false)
    onClose()
  }

  const requestConfirmation = (event) => {
    event.preventDefault()
    setError('')
    const trimmed = value.trim()
    if (!trimmed) {
      setError(t('profile.studentIdRequired'))
      return
    }
    if (!/^[0-9]{10}$/.test(trimmed)) {
      setError(t('profile.studentIdDigitsError'))
      return
    }
    if (lamduanStudentId && trimmed !== lamduanStudentId) {
      setError(t('profile.studentIdLamduanError'))
      return
    }
    if (trimmed === user.studentId) {
      setError(t('profile.studentIdDifferentError'))
      return
    }
    setValue(trimmed)
    setConfirming(true)
  }

  const confirmSave = async () => {
    setSaving(true)
    setError('')
    try {
      await updateStudentId(value)
      setConfirming(false)
      onClose()
    } catch (saveError) {
      const translationKey = studentIdErrorKeys[saveError.message]
      setError(translationKey ? t(translationKey) : saveError.message)
      setConfirming(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Modal
        open={!confirming}
        onClose={closeEditor}
        title={user.studentId ? t('profile.updateStudentId') : t('profile.addStudentId')}
        description={lamduanStudentId
          ? t('profile.lamduanStudentIdDescription')
          : t('profile.manualStudentIdDescription')}
      >
        <form onSubmit={requestConfirmation} className="space-y-5">
          <Field label={t('profile.studentId')} required error={error} hint={t('profile.checkStudentIdHint')}>
            <Input
              value={value}
              onChange={(event) => { setValue(event.target.value); setError('') }}
              placeholder="e.g. 6631503086"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              autoComplete="off"
              autoFocus
            />
          </Field>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" disabled={saving} onClick={closeEditor}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={saving}>{t('profile.reviewStudentId')}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={confirming}
        onClose={() => !saving && setConfirming(false)}
        onConfirm={confirmSave}
        title={user.studentId ? t('profile.confirmStudentIdUpdate') : t('profile.confirmStudentId')}
        description={t('profile.confirmStudentIdDescription', { id: value })}
        confirmLabel={saving ? t('common.saving') : user.studentId ? t('profile.confirmUpdate') : t('profile.confirmAndSave')}
        disabled={saving}
      />
    </>
  )
}

export function ProfilePage() {
  const { user } = useApp()
  const { t } = useLanguage()
  const [studentIdEditorOpen, setStudentIdEditorOpen] = useState(false)
  const isStudent = user.role === 'student'
  const lamduanStudentId = getLamduanStudentId(user.email)
  const hasAuthoritativeLamduanId = Boolean(lamduanStudentId && user.studentId === lamduanStudentId)

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
          {isStudent && hasAuthoritativeLamduanId ? (
            <div className="flex min-w-0 gap-3">
              <IdCard className="mt-0.5 shrink-0 text-mfu-700" size={18} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">{t('profile.studentId')}</p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.studentId}</p>
                <p className="mt-1 text-xs text-mfu-700">{t('profile.verifiedFromLamduan')}</p>
              </div>
              <ShieldCheck className="mt-1 shrink-0 text-mfu-700" size={16} aria-label={t('profile.verifiedFromLamduan')} />
            </div>
          ) : isStudent ? (
            <button
              type="button"
              className="group flex min-w-0 gap-3 rounded-xl text-left outline-none transition hover:text-mfu-800 focus-visible:ring-2 focus-visible:ring-mfu-500 focus-visible:ring-offset-4"
              onClick={() => setStudentIdEditorOpen(true)}
              aria-label={user.studentId ? t('profile.editStudentId') : t('profile.addStudentId')}
            >
              <IdCard className="mt-0.5 shrink-0 text-slate-400 transition group-hover:text-mfu-700" size={18} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">{t('profile.studentId')}</p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.studentId || t('profile.studentIdNotSet')}</p>
              </div>
              <Pencil className="mt-1 shrink-0 text-slate-300 transition group-hover:text-mfu-700" size={15} aria-hidden="true" />
            </button>
          ) : (
            <div className="flex min-w-0 gap-3"><UserRound className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">{t('profile.accountId')}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.id}</p></div></div>
          )}
          <div className="flex min-w-0 gap-3"><Mail className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">{t('common.email')}</p><p className="mt-1 break-all text-sm font-semibold text-slate-800">{user.email}</p></div></div>
          <div className="flex min-w-0 gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">{t('common.role')}</p><p className="mt-1 text-sm font-semibold text-slate-800">{translatedRoleLabel(t, user.role)}</p></div></div>
          <div className="flex min-w-0 gap-3"><Building2 className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">{t('profile.schoolAdvisor')}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.role === 'student' ? (user.advisor ? t('profile.advisorNamed', { name: user.advisor }) : t('profile.advisorNotAssigned')) : user.department}</p></div></div>
        </div>
      </Card>
      {isStudent && studentIdEditorOpen && <StudentIdEditor onClose={() => setStudentIdEditorOpen(false)} />}
    </div>
  )
}
