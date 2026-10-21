import { UsersRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useApp } from '../../app/AppContext'
import { Card, PageHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/FormFields'
import { useLanguage } from '../../i18n/LanguageContext'
import { roleLabels, translatedRoleLabel } from '../auth/roles'
import { getManageableUsers, setUserRole } from './userService'

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
  const { t } = useLanguage()
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-slate-900">{profile.name}</p>
      <p className="mt-0.5 truncate text-xs text-slate-500">{profile.email}</p>
      <p className="mt-0.5 text-xs text-slate-400">{profile.universityId || t('users.universityIdNotSet')}</p>
    </div>
  )
}

export function UserManagementPage() {
  const { user: currentUser } = useApp()
  const { t } = useLanguage()
  const { users, loading, error, setError, refresh } = useManagedUsers()
  const [busyId, setBusyId] = useState(null)

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

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('users.deanAdministrationEyebrow')} title={t('nav.userManagement')} description={t('users.userManagementDescription')} />
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.keys(roleLabels).map((role) => <Card key={role} className="p-5"><p className="text-sm text-slate-500">{t(`roles.${role}Plural`)}</p><p className="mt-2 text-3xl font-bold text-slate-950">{users.filter((profile) => profile.role === role).length}</p></Card>)}
      </div>
      <Card className="overflow-hidden">
        {loading ? <p className="p-6 text-sm text-slate-500">{t('users.loadingUsers')}</p> : users.length ? (
          <div className="divide-y divide-slate-100">
            {users.map((profile) => (
              <div key={profile.id} className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center lg:px-5">
                <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mfu-50 text-mfu-700"><UsersRound size={18} /></span><UserIdentity profile={profile} /></div>
                <label className="text-xs font-semibold text-slate-500">{t('common.role')}
                  <Select className="mt-1" value={profile.role} disabled={profile.id === currentUser.id || busyId === profile.id} onChange={(event) => changeRole(profile, event.target.value)}>
                    {Object.keys(roleLabels).map((value) => <option key={value} value={value}>{translatedRoleLabel(t, value)}</option>)}
                  </Select>
                </label>
              </div>
            ))}
          </div>
        ) : <EmptyState title={t('users.noUsersFound')} description={t('users.noUsersFoundDescription')} />}
      </Card>
    </div>
  )
}
