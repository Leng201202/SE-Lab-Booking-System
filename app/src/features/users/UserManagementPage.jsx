import { ShieldCheck, UserRoundCheck, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/FormFields'
import { Badge } from '../../components/ui/StatusBadge'
import { roleLabels } from '../auth/roles'
import { assignStudentAdvisor, getManageableUsers, setUserRole } from './userService'

function useManagedUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(await getManageableUsers())
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    getManageableUsers()
      .then((nextUsers) => { if (active) setUsers(nextUsers) })
      .catch((nextError) => { if (active) setError(nextError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  return { users, loading, error, setError, refresh }
}

function UserIdentity({ profile }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-slate-900">{profile.name}</p>
      <p className="mt-0.5 truncate text-xs text-slate-500">{profile.email}</p>
      <p className="mt-0.5 text-xs text-slate-400">{profile.universityId || 'University ID not set'}</p>
    </div>
  )
}

export function AdviseeManagementPage() {
  const { user } = useApp()
  const { users, loading, error, setError, refresh } = useManagedUsers()
  const [busyId, setBusyId] = useState(null)
  const students = users.filter((profile) => profile.role === 'student')

  const changeAssignment = async (student, advisorId) => {
    setBusyId(student.id)
    setError('')
    try {
      await assignStudentAdvisor(student.id, advisorId)
      await refresh()
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Advisor tools" title="Manage advisees" description="Assign unassigned Students to yourself or release Students currently assigned to you." />
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
      <Card className="overflow-hidden">
        {loading ? <p className="p-6 text-sm text-slate-500">Loading Students…</p> : students.length ? (
          <div className="divide-y divide-slate-100">
            {students.map((student) => {
              const assignedToMe = student.advisorId === user.id
              return (
                <div key={student.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <UserIdentity profile={student} />
                  <div className="flex items-center gap-3">
                    <Badge tone={assignedToMe ? 'green' : 'slate'}>{assignedToMe ? 'My advisee' : 'Unassigned'}</Badge>
                    <Button
                      size="sm"
                      variant={assignedToMe ? 'secondary' : 'primary'}
                      disabled={busyId === student.id}
                      onClick={() => changeAssignment(student, assignedToMe ? null : user.id)}
                    >
                      <UserRoundCheck size={16} />{assignedToMe ? 'Release' : 'Assign to me'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : <EmptyState title="No manageable Students" description="Students assigned to other Advisors are not exposed here." />}
      </Card>
    </div>
  )
}

export function UserManagementPage() {
  const { user: currentUser } = useApp()
  const { users, loading, error, setError, refresh } = useManagedUsers()
  const [busyId, setBusyId] = useState(null)
  const advisors = useMemo(() => users.filter((profile) => profile.role === 'advisor'), [users])

  const changeRole = async (profile, role) => {
    setBusyId(profile.id)
    setError('')
    try {
      await setUserRole(profile.id, role)
      await refresh()
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setBusyId(null)
    }
  }

  const changeAdvisor = async (profile, advisorId) => {
    setBusyId(profile.id)
    setError('')
    try {
      await assignStudentAdvisor(profile.id, advisorId)
      await refresh()
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Dean administration" title="User management" description="Manage application roles and assign Students to eligible Advisors." />
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.keys(roleLabels).map((role) => <Card key={role} className="p-5"><p className="text-sm text-slate-500">{roleLabels[role]}s</p><p className="mt-2 text-3xl font-bold text-slate-950">{users.filter((profile) => profile.role === role).length}</p></Card>)}
      </div>
      <Card className="overflow-hidden">
        {loading ? <p className="p-6 text-sm text-slate-500">Loading users…</p> : users.length ? (
          <div className="divide-y divide-slate-100">
            {users.map((profile) => (
              <div key={profile.id} className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_180px_240px] lg:items-center lg:px-5">
                <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mfu-50 text-mfu-700"><UsersRound size={18} /></span><UserIdentity profile={profile} /></div>
                <label className="text-xs font-semibold text-slate-500">Role
                  <Select className="mt-1" value={profile.role} disabled={profile.id === currentUser.id || busyId === profile.id} onChange={(event) => changeRole(profile, event.target.value)}>
                    {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </Select>
                </label>
                {profile.role === 'student' ? (
                  <label className="text-xs font-semibold text-slate-500">Assigned Advisor
                    <Select className="mt-1" value={profile.advisorId || ''} disabled={busyId === profile.id} onChange={(event) => changeAdvisor(profile, event.target.value || null)}>
                      <option value="">Unassigned</option>
                      {advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.name}</option>)}
                    </Select>
                  </label>
                ) : <div className="flex items-center gap-2 text-sm text-slate-500"><ShieldCheck size={17} />Privileged university role</div>}
              </div>
            ))}
          </div>
        ) : <EmptyState title="No users found" description="Profiles appear after verified Google sign-in." />}
      </Card>
    </div>
  )
}
