import { Building2, IdCard, Mail, Pencil, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { Field, Input } from '../../components/ui/FormFields'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { roleLabels } from './roles'

function getLamduanStudentId(email) {
  return /^([0-9]{10})@lamduan\.mfu\.ac\.th$/i.exec(email.trim())?.[1] || null
}

function StudentIdEditor({ onClose }) {
  const { user, updateStudentId } = useApp()
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
      setError('Student ID is required.')
      return
    }
    if (!/^[0-9]{10}$/.test(trimmed)) {
      setError('Student ID must contain exactly 10 digits.')
      return
    }
    if (lamduanStudentId && trimmed !== lamduanStudentId) {
      setError('Student ID must match your Lamduan email.')
      return
    }
    if (trimmed === user.studentId) {
      setError('Enter a different Student ID before saving.')
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
      setError(saveError.message)
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
        title={user.studentId ? 'Update Student ID' : 'Add Student ID'}
        description={lamduanStudentId
          ? 'Your Student ID is determined by your verified Lamduan email and must match it exactly.'
          : 'Enter the 10-digit Student ID from your university record. It is required before you can submit a booking request.'}
      >
        <form onSubmit={requestConfirmation} className="space-y-5">
          <Field label="Student ID" required error={error} hint="Check every character before continuing.">
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
            <Button type="button" variant="secondary" disabled={saving} onClick={closeEditor}>Cancel</Button>
            <Button type="submit" disabled={saving}>Review Student ID</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={confirming}
        onClose={() => !saving && setConfirming(false)}
        onConfirm={confirmSave}
        title={user.studentId ? 'Confirm Student ID update' : 'Confirm Student ID'}
        description={`Save ${value} as your Student ID? Make sure it exactly matches your university record.`}
        confirmLabel={saving ? 'Saving…' : user.studentId ? 'Confirm update' : 'Confirm and save'}
        disabled={saving}
      />
    </>
  )
}

export function ProfilePage() {
  const { user } = useApp()
  const [studentIdEditorOpen, setStudentIdEditorOpen] = useState(false)
  const isStudent = user.role === 'student'
  const lamduanStudentId = getLamduanStudentId(user.email)
  const hasAuthoritativeLamduanId = Boolean(lamduanStudentId && user.studentId === lamduanStudentId)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Authenticated account" title="Profile" description="Your identity comes from Google; your application role and Advisor assignment are controlled by the university." />
      <Card className="max-w-3xl overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-r from-mfu-700 to-mfu-900 px-4 py-6 text-white sm:px-6 sm:py-8">
          <div className="brand-stripe absolute inset-x-0 top-0 h-1" aria-hidden="true" />
          <div className="grid size-16 place-items-center rounded-2xl bg-white/15 text-xl font-bold">{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
          <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
          <p className="mt-1 text-sm text-emerald-100/75">{roleLabels[user.role]} account</p>
        </div>
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
          {isStudent && hasAuthoritativeLamduanId ? (
            <div className="flex min-w-0 gap-3">
              <IdCard className="mt-0.5 shrink-0 text-mfu-700" size={18} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">Student ID</p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.studentId}</p>
                <p className="mt-1 text-xs text-mfu-700">Verified from Lamduan email</p>
              </div>
              <ShieldCheck className="mt-1 shrink-0 text-mfu-700" size={16} aria-label="Verified from Lamduan email" />
            </div>
          ) : isStudent ? (
            <button
              type="button"
              className="group flex min-w-0 gap-3 rounded-xl text-left outline-none transition hover:text-mfu-800 focus-visible:ring-2 focus-visible:ring-mfu-500 focus-visible:ring-offset-4"
              onClick={() => setStudentIdEditorOpen(true)}
              aria-label={user.studentId ? 'Edit Student ID' : 'Add Student ID'}
            >
              <IdCard className="mt-0.5 shrink-0 text-slate-400 transition group-hover:text-mfu-700" size={18} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">Student ID</p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.studentId || 'Not set — click to add'}</p>
              </div>
              <Pencil className="mt-1 shrink-0 text-slate-300 transition group-hover:text-mfu-700" size={15} aria-hidden="true" />
            </button>
          ) : (
            <div className="flex min-w-0 gap-3"><UserRound className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">Account ID</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.id}</p></div></div>
          )}
          <div className="flex min-w-0 gap-3"><Mail className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">Email</p><p className="mt-1 break-all text-sm font-semibold text-slate-800">{user.email}</p></div></div>
          <div className="flex min-w-0 gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">Role</p><p className="mt-1 text-sm font-semibold text-slate-800">{roleLabels[user.role]}</p></div></div>
          <div className="flex min-w-0 gap-3"><Building2 className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">School / Advisor</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.role === 'student' ? (user.advisor ? `Advisor: ${user.advisor}` : 'Advisor not assigned') : user.department}</p></div></div>
        </div>
      </Card>
      {isStudent && studentIdEditorOpen && <StudentIdEditor onClose={() => setStudentIdEditorOpen(false)} />}
    </div>
  )
}
