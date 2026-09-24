import { Building2, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { Field, Input } from '../../components/ui/FormFields'
import { roleLabels } from './roles'

function StudentIdCard() {
  const { user, updateStudentId } = useApp()
  const [value, setValue] = useState(user.studentId || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onSave = async (event) => {
    event.preventDefault()
    setError('')
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Student ID is required.')
      return
    }
    setSaving(true)
    try {
      await updateStudentId(trimmed)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="max-w-3xl p-4 sm:p-6">
      <h2 className="font-bold text-slate-900">Student ID</h2>
      <p className="mt-1 text-sm text-slate-500">
        {user.email.endsWith('@lamduan.mfu.ac.th')
          ? 'This was filled in automatically from your Lamduan email.'
          : 'Your email is not a Lamduan address, so this was not filled in automatically. You must set it before you can submit a booking request.'}
      </p>
      <form onSubmit={onSave} className="mt-4 flex flex-col gap-3 sm:max-w-sm">
        <Field label="Student ID" required error={error}>
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. 6631503086"
          />
        </Field>
        <Button type="submit" size="sm" className="w-full sm:w-auto" disabled={saving}>
          {saving ? 'Saving…' : 'Save Student ID'}
        </Button>
      </form>
    </Card>
  )
}

export function ProfilePage() {
  const { user } = useApp()
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
          <div className="flex min-w-0 gap-3"><UserRound className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">Account ID</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.studentId || user.id}</p></div></div>
          <div className="flex min-w-0 gap-3"><Mail className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">Email</p><p className="mt-1 break-all text-sm font-semibold text-slate-800">{user.email}</p></div></div>
          <div className="flex min-w-0 gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">Role</p><p className="mt-1 text-sm font-semibold text-slate-800">{roleLabels[user.role]}</p></div></div>
          <div className="flex min-w-0 gap-3"><Building2 className="mt-0.5 shrink-0 text-slate-400" size={18} /><div className="min-w-0"><p className="text-xs text-slate-400">School / Advisor</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{user.role === 'student' ? (user.advisor ? `Advisor: ${user.advisor}` : 'Advisor not assigned') : user.department}</p></div></div>
        </div>
      </Card>
      {user.role === 'student' && <StudentIdCard />}
    </div>
  )
}
