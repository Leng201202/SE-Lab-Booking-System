import { useState } from 'react'
import {
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  ClipboardCheck,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorCog,
  Settings2,
  Users,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { translatedRoleLabel } from '../../features/auth/roles'
import { LanguageToggle } from '../ui/LanguageToggle'

function useRoleNavigation(t) {
  return {
    student: [
      { label: t('nav.dashboard'), to: '/dashboard', icon: LayoutDashboard },
      { label: t('nav.bookPc'), to: '/book', icon: MonitorCog },
      { label: t('nav.myBookings'), to: '/bookings', icon: BookOpenCheck },
      { label: t('nav.calendar'), to: '/calendar', icon: CalendarDays },
      { label: t('nav.profile'), to: '/profile', icon: CircleUserRound },
    ],
    advisor: [
      { label: t('nav.dashboard'), to: '/dashboard', icon: LayoutDashboard },
      { label: t('nav.bookPc'), to: '/book', icon: MonitorCog },
      { label: t('nav.myBookings'), to: '/bookings', icon: BookOpenCheck },
      { label: t('nav.pendingRequests'), to: '/requests/pending', icon: ClipboardCheck },
      { label: t('nav.requestHistory'), to: '/requests/history', icon: History },
      { label: t('nav.manageAdvisees'), to: '/manage/advisees', icon: Users },
      { label: t('nav.pcInventory'), to: '/pcs', icon: MonitorCog },
      { label: t('nav.calendar'), to: '/calendar', icon: CalendarDays },
      { label: t('nav.profile'), to: '/profile', icon: CircleUserRound },
    ],
    technician: [
      { label: t('nav.dashboard'), to: '/dashboard', icon: LayoutDashboard },
      { label: t('nav.bookPc'), to: '/book', icon: MonitorCog },
      { label: t('nav.myBookings'), to: '/bookings', icon: BookOpenCheck },
      { label: t('nav.pendingRequests'), to: '/requests/pending', icon: ClipboardCheck },
      { label: t('nav.requestHistory'), to: '/requests/history', icon: History },
      { label: t('nav.pcManagement'), to: '/admin/pcs', icon: Settings2 },
      { label: t('nav.pcInventory'), to: '/pcs', icon: MonitorCog },
      { label: t('nav.calendar'), to: '/calendar', icon: CalendarDays },
      { label: t('nav.profile'), to: '/profile', icon: CircleUserRound },
    ],
    dean: [
      { label: t('nav.dashboard'), to: '/dashboard', icon: LayoutDashboard },
      { label: t('nav.bookPc'), to: '/book', icon: MonitorCog },
      { label: t('nav.myBookings'), to: '/bookings', icon: BookOpenCheck },
      { label: t('nav.pendingApproval'), to: '/requests/pending', icon: ClipboardCheck },
      { label: t('nav.approvalHistory'), to: '/requests/history', icon: History },
      { label: t('nav.userManagement'), to: '/admin/users', icon: Users },
      { label: t('nav.pcManagement'), to: '/admin/pcs', icon: Settings2 },
      { label: t('nav.pcInventory'), to: '/pcs', icon: MonitorCog },
      { label: t('nav.calendar'), to: '/calendar', icon: CalendarDays },
      { label: t('nav.profile'), to: '/profile', icon: CircleUserRound },
    ],
  }
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-3">
      <span className="grid size-11 place-items-center"><img src="/SE_Logo.png" alt="Software Engineering logo" className="h-full w-auto object-contain drop-shadow-lg" /></span>
      <div>
        <p className="font-bold tracking-tight text-white">SE Lab</p>
        <p className="text-xs text-emerald-100/65">MFU · Software Engineering</p>
      </div>
    </div>
  )
}

function Sidebar({ onNavigate }) {
  const { user } = useApp()
  const { t } = useLanguage()
  const roleNavigation = useRoleNavigation(t)
  return (
    <div className="relative flex h-full flex-col overflow-y-auto overflow-x-hidden bg-mfu-950 px-4 py-6 text-slate-300">
      <div className="brand-stripe absolute inset-x-0 top-0 h-1" aria-hidden="true" />
      <Brand />
      <div className="mx-3 mt-7 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Secure portal</p>
        <p className="mt-1 text-xs leading-5 text-emerald-100/55">Supabase-backed workspace</p>
      </div>
      <nav className="mt-6 flex-1 space-y-1" aria-label="Main navigation">
        {roleNavigation[user.role].map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-mfu-600 text-white shadow-md shadow-black/20' : 'text-emerald-100/60 hover:bg-white/[0.07] hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 px-3 pt-4 text-xs leading-5 text-emerald-100/40">
        <span className="font-semibold text-emerald-100/60">Mae Fah Luang University</span><br />School of Applied Digital Technology
      </div>
    </div>
  )
}

export function AppShell() {
  const { user, logout, toast } = useApp()
  const { t } = useLanguage()
  const roleNavigation = useRoleNavigation(t)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const pageName = roleNavigation[user.role].find((item) =>
    location.pathname === item.to || (item.to === '/bookings' && location.pathname.startsWith('/bookings/')),
  )?.label || t('shell.requestDetail')

  return (
    <div className="min-h-screen bg-[#f5f8f5] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 md:block"><Sidebar /></aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
          <aside className="relative h-full w-[min(18rem,calc(100vw-2rem))] shadow-2xl">
            <button className="absolute right-3 top-4 z-10 grid size-11 place-items-center rounded-xl text-slate-300 hover:bg-white/10" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-mfu-100 bg-white/92 px-3 backdrop-blur sm:h-18 sm:px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button className="grid size-11 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
            <div className="min-w-0">
              <p className="truncate text-[11px] text-slate-400 sm:text-xs">{t('shell.roleWorkspace', { role: translatedRoleLabel(t, user.role) })}</p>
              <p className="truncate text-sm font-bold text-slate-800">{pageName}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <LanguageToggle />
            <div className="relative">
              <button className="flex min-h-11 items-center gap-2 rounded-xl p-1 pr-1.5 text-left hover:bg-slate-100 sm:gap-3 sm:p-1.5 sm:pr-2" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mfu-100 text-sm font-bold text-mfu-700">{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
                <span className="hidden sm:block">
                  <span className="block max-w-44 truncate text-sm font-semibold text-slate-800">{user.shortName || user.name}</span>
                  <span className="block text-xs text-slate-400">{translatedRoleLabel(t, user.role)}</span>
                </span>
                <ChevronDown size={15} className="text-slate-400" />
              </button>

              {profileOpen && (
                <div className="fixed inset-x-3 top-16 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:w-64">
                  <p className="px-3 pb-1 pt-2 text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="px-3 pb-2 text-xs text-slate-400">{translatedRoleLabel(t, user.role)} · {user.email}</p>
                  <div className="my-2 border-t border-slate-100" />
                  <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><CircleUserRound size={16} /> {t('common.profile')}</Link>
                  <button onClick={async () => {
                    try {
                      await logout()
                      setProfileOpen(false)
                      navigate('/login')
                    } catch {
                      // The shared context keeps the session in place and surfaces the error.
                    }
                  }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut size={16} /> {t('common.logOut')}</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-3 sm:p-6 lg:p-8"><Outlet /></main>
      </div>

      {toast && (
        <div className={`fixed inset-x-3 bottom-3 z-[60] rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-sm ${toast.tone === 'error' ? 'bg-red-600' : 'bg-mfu-800'}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  )
}
