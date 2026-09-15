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
  RotateCcw,
  X,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { demoUsers, roleLabels } from '../../data/mockUsers'

const roleNavigation = {
  student: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Book a PC', to: '/book', icon: MonitorCog },
    { label: 'My Bookings', to: '/bookings', icon: BookOpenCheck },
    { label: 'Calendar', to: '/calendar', icon: CalendarDays },
    { label: 'Profile', to: '/profile', icon: CircleUserRound },
  ],
  advisor: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Pending Requests', to: '/requests/pending', icon: ClipboardCheck },
    { label: 'Request History', to: '/requests/history', icon: History },
    { label: 'Calendar', to: '/calendar', icon: CalendarDays },
    { label: 'Profile', to: '/profile', icon: CircleUserRound },
  ],
  dean: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Pending Approval', to: '/requests/pending', icon: ClipboardCheck },
    { label: 'Approval History', to: '/requests/history', icon: History },
    { label: 'Calendar', to: '/calendar', icon: CalendarDays },
    { label: 'Profile', to: '/profile', icon: CircleUserRound },
  ],
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-3">
      <span className="grid size-11 place-items-center rounded-xl bg-white p-1.5 shadow-lg shadow-black/20"><img src="/SE_Logo.png" alt="Software Engineering logo" className="h-full w-auto object-contain" /></span>
      <div>
        <p className="font-bold tracking-tight text-white">SE Lab</p>
        <p className="text-xs text-emerald-100/65">MFU · Software Engineering</p>
      </div>
    </div>
  )
}

function Sidebar({ onNavigate }) {
  const { user } = useApp()
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-mfu-950 px-4 py-6 text-slate-300">
      <div className="brand-stripe absolute inset-x-0 top-0 h-1" aria-hidden="true" />
      <Brand />
      <div className="mx-3 mt-7 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Demo mode</p>
        <p className="mt-1 text-xs leading-5 text-emerald-100/55">Frontend workflow preview</p>
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
  const { user, selectRole, logout, resetDemo, toast } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const switchRole = (role) => {
    selectRole(role)
    setProfileOpen(false)
    navigate('/dashboard')
  }

  const pageName = roleNavigation[user.role].find((item) =>
    location.pathname === item.to || (item.to === '/bookings' && location.pathname.startsWith('/bookings/')),
  )?.label || 'Request detail'

  return (
    <div className="min-h-screen bg-[#f5f8f5] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 md:block"><Sidebar /></aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
          <aside className="relative h-full w-72 shadow-2xl">
            <button className="absolute right-3 top-4 z-10 rounded-lg p-2 text-slate-400 hover:bg-white/10" onClick={() => setMobileOpen(false)}><X size={20} /></button>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-mfu-100 bg-white/92 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
            <div>
              <p className="text-xs text-slate-400">{roleLabels[user.role]} workspace</p>
              <p className="text-sm font-bold text-slate-800">{pageName}</p>
            </div>
          </div>

          <div className="relative">
            <button className="flex items-center gap-3 rounded-xl p-1.5 pr-2 text-left hover:bg-slate-100" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
              <span className="grid size-9 place-items-center rounded-full bg-mfu-100 text-sm font-bold text-mfu-700">{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
              <span className="hidden sm:block">
                <span className="block max-w-44 truncate text-sm font-semibold text-slate-800">{user.shortName || user.name}</span>
                <span className="block text-xs capitalize text-slate-400">Demo {user.role}</span>
              </span>
              <ChevronDown size={15} className="text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Switch demo role</p>
                {Object.keys(demoUsers).map((role) => (
                  <button key={role} onClick={() => switchRole(role)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${user.role === role ? 'bg-mfu-50 text-mfu-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {roleLabels[role]}
                    {user.role === role && <span className="size-2 rounded-full bg-mfu-600" />}
                  </button>
                ))}
                <div className="my-2 border-t border-slate-100" />
                <button onClick={() => { resetDemo(); setProfileOpen(false) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><RotateCcw size={16} /> Reset demo data</button>
                <button onClick={() => { logout(); navigate('/login') }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut size={16} /> Log out</button>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>

      {toast && (
        <div className={`fixed bottom-5 right-5 z-[60] max-w-sm rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${toast.tone === 'error' ? 'bg-red-600' : 'bg-mfu-800'}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  )
}
