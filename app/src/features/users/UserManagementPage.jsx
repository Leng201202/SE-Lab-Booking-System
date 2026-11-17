import { Search, UsersRound, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useApp } from '../../app/AppContext'
import { Card, PageHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Select } from '../../components/ui/FormFields'
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

function matchesSearch(profile, query) {
  return [profile.name, profile.email, profile.universityId]
    .some((value) => value && String(value).toLowerCase().includes(query))
}

export function UserManagementPage() {
  const { user: currentUser } = useApp()
  const { t } = useLanguage()
  const { users, loading, error, setError, refresh } = useManagedUsers()
  const [busyId, setBusyId] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const query = search.trim().toLowerCase()
  const filtering = Boolean(query || roleFilter)
  const visibleUsers = useMemo(
    () => users.filter((profile) => (!roleFilter || profile.role === roleFilter) && (!query || matchesSearch(profile, query))),
    [users, query, roleFilter],
  )

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('users.searchPlaceholder')}
            aria-label={t('users.searchLabel')}
            className="pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label={t('users.clearSearch')} className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>
        <Select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          aria-label={t('users.roleFilterLabel')}
          className="sm:w-48"
        >
          <option value="">{t('users.allRoles')}</option>
          {Object.keys(roleLabels).map((value) => <option key={value} value={value}>{translatedRoleLabel(t, value)}</option>)}
        </Select>
        {!loading && filtering && (
          <p className="text-sm text-slate-500 sm:ml-auto" aria-live="polite">{t('users.searchResultCount', { shown: visibleUsers.length, total: users.length })}</p>
        )}
      </div>
      <Card className="overflow-hidden">
        {loading ? <p className="p-6 text-sm text-slate-500">{t('users.loadingUsers')}</p> : visibleUsers.length ? (
          <div className="divide-y divide-slate-100">
            {visibleUsers.map((profile) => (
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
        ) : filtering && users.length
          ? <EmptyState title={t('users.noSearchResults')} description={t('users.noSearchResultsDescription')} />
          : <EmptyState title={t('users.noUsersFound')} description={t('users.noUsersFoundDescription')} />}
      </Card>
    </div>
  )
}
