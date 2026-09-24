import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileClock,
  FileX2,
  MonitorUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { BookingTable } from '../../components/ui/BookingTable'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader, StatCard } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { translatedRoleLabel } from '../auth/roles'
import { useLanguage } from '../../i18n/LanguageContext'
import { formatBookingDateRange, formatBookingTime, getBangkokDateKey } from '../../utils/booking'

function SectionTitle({ title, link, linkLabel }) {
  const { t } = useLanguage()
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
      <h2 className="min-w-0 font-bold text-slate-900">{title}</h2>
      {link && <Link className="flex shrink-0 items-center gap-1 text-xs font-semibold text-mfu-700 hover:text-mfu-900" to={link}>{linkLabel ?? t('common.viewAll')}<ArrowRight size={14} /></Link>}
    </div>
  )
}

function StudentDashboard() {
  const { user, bookings } = useApp()
  const { t } = useLanguage()
  const mine = bookings.filter((booking) => booking.requesterId === user.id)
  const count = (status) => mine.filter((booking) => booking.status === status).length
  const today = getBangkokDateKey()
  const upcoming = mine
    .filter((booking) => booking.status === 'approved' && booking.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0]

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('dashboard.studentEyebrow')} title={t('dashboard.welcomeBack', { name: user.name.split(' ')[0] })} description={t('dashboard.studentDescription')} action={<Link to="/book"><Button><MonitorUp size={17} />{t('nav.bookPc')}</Button></Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label={t('dashboard.totalRequests')} value={mine.length} icon={FileCheck2} detail={t('dashboard.totalRequestsDetail')} />
        <StatCard label={t('dashboard.pendingTechnician')} value={count('pending_technician')} icon={Clock3} tone="blue" detail={t('dashboard.pendingTechnicianDetail')} />
        <StatCard label={t('dashboard.pendingAdvisor')} value={count('pending_advisor')} icon={Clock3} tone="amber" detail={t('dashboard.pendingAdvisorDetail')} />
        <StatCard label={t('dashboard.pendingDean')} value={count('pending_dean')} icon={FileClock} tone="violet" detail={t('dashboard.pendingDeanDetail')} />
        <StatCard label={t('dashboard.approved')} value={count('approved')} icon={CheckCircle2} tone="green" detail={t('dashboard.approvedDetail')} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card className="overflow-hidden">
          <SectionTitle title={t('dashboard.recentRequests')} link="/bookings" />
          {mine.length ? <BookingTable bookings={mine.slice(0, 4)} /> : <EmptyState />}
        </Card>
        <Card className="overflow-hidden">
          <SectionTitle title={t('dashboard.upcomingBooking')} link="/calendar" linkLabel={t('nav.calendar')} />
          {upcoming ? (
            <div className="p-4 sm:p-5">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mfu-700 to-mfu-900 p-4 text-white shadow-lg shadow-mfu-900/15 sm:p-5">
                <div className="brand-stripe absolute inset-x-0 top-0 h-1" aria-hidden="true" />
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-white/12"><CalendarCheck2 size={21} /></span>
                  <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-semibold text-emerald-200">{t('common.confirmed')}</span>
                </div>
                <p className="mt-8 text-3xl font-bold tracking-tight">{upcoming.pcId}</p>
                <p className="mt-1 text-sm text-emerald-100/75">{upcoming.room}</p>
                <div className="mt-5 border-t border-white/15 pt-4 text-sm">
                  <p className="font-semibold">{formatBookingDateRange(upcoming)}</p>
                  <p className="mt-1 text-emerald-100/75">{formatBookingTime(upcoming, t)}</p>
                </div>
              </div>
            </div>
          ) : <EmptyState title={t('dashboard.noApprovedBooking')} description={t('dashboard.noApprovedBookingDescription')} />}
        </Card>
      </div>
    </div>
  )
}

function ReviewerDashboard({ role }) {
  const { user, bookings } = useApp()
  const { t } = useLanguage()
  const reviewer = {
    technician: { status: 'pending_technician', decisionAt: 'technicianDecisionAt', description: t('dashboard.technicianDescription'), approvedDetail: t('dashboard.technicianApprovedDetail') },
    advisor: { status: 'pending_advisor', decisionAt: 'advisorDecisionAt', description: t('dashboard.advisorDescription'), approvedDetail: t('dashboard.advisorApprovedDetail') },
    dean: { status: 'pending_dean', decisionAt: null, description: t('dashboard.deanDescription'), approvedDetail: t('dashboard.deanApprovedDetail') },
  }[role]
  const isDean = role === 'dean'
  const pendingStatus = reviewer.status
  const pending = bookings.filter((booking) => booking.status === pendingStatus)
  const today = getBangkokDateKey()
  const approved = bookings.filter((booking) => !isDean
    ? booking[reviewer.decisionAt] && getBangkokDateKey(booking[reviewer.decisionAt]) === today
    : booking.deanDecision === 'approved')
  const rejected = bookings.filter((booking) => booking.rejectedBy === role)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('dashboard.roleDashboard', { role: translatedRoleLabel(t, role) })} title={t('dashboard.goodMorning', { name: user.shortName || user.name })} description={reviewer.description} action={<Link to="/requests/pending"><Button>{t('dashboard.reviewPending')} <ArrowRight size={17} /></Button></Link>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t('dashboard.pendingRequestsStat')} value={pending.length} icon={FileClock} tone="amber" detail={t('dashboard.pendingRequestsDetail')} />
        <StatCard label={isDean ? t('dashboard.approvedBookings') : t('dashboard.approvedToday')} value={approved.length} icon={CheckCircle2} tone="green" detail={reviewer.approvedDetail} />
        <StatCard label={t('dashboard.rejectedRequests')} value={rejected.length} icon={FileX2} tone="red" detail={t('dashboard.rejectedRequestsDetail')} />
      </div>
      <Card className="overflow-hidden">
        <SectionTitle title={t('dashboard.requestsRequiringAttention')} link="/requests/pending" />
        {pending.length ? <BookingTable bookings={pending.slice(0, 5)} showRequester showAdvisor={isDean} /> : <EmptyState title={t('dashboard.allCaughtUp')} description={t('dashboard.allCaughtUpDescription')} />}
      </Card>
      <Card className="overflow-hidden">
        <SectionTitle title={t('dashboard.recentRequests')} link="/requests/history" linkLabel={t('dashboard.viewHistory')} />
        <div className="divide-y divide-slate-100">
          {bookings.slice(0, 4).map((booking) => (
            <Link key={booking.id} to={`/bookings/${booking.id}`} className="flex flex-col items-start gap-3 px-4 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{booking.requesterName} · {booking.pcId}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{formatBookingDateRange(booking)} · {formatBookingTime(booking, t)}</p>
              </div>
              <StatusBadge status={booking.status} />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useApp()
  if (user.role === 'student') return <StudentDashboard />
  return <ReviewerDashboard role={user.role} />
}
