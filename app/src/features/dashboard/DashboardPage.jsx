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
import { format } from 'date-fns'
import { useApp } from '../../app/AppContext'
import { BookingTable } from '../../components/ui/BookingTable'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader, StatCard } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatBookingDateRange, formatBookingTime } from '../../utils/booking'

function SectionTitle({ title, link, linkLabel = 'View all' }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
      <h2 className="min-w-0 font-bold text-slate-900">{title}</h2>
      {link && <Link className="flex shrink-0 items-center gap-1 text-xs font-semibold text-mfu-700 hover:text-mfu-900" to={link}>{linkLabel}<ArrowRight size={14} /></Link>}
    </div>
  )
}

function StudentDashboard() {
  const { user, bookings } = useApp()
  const mine = bookings.filter((booking) => booking.studentId === user.id)
  const count = (status) => mine.filter((booking) => booking.status === status).length
  const upcoming = mine.find((booking) => booking.status === 'approved')

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Student dashboard" title={`Welcome back, ${user.name.split(' ')[0]}`} description="Track your requests and reserve a workstation for your next lab session." action={<Link to="/book"><Button><MonitorUp size={17} />Book a PC</Button></Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Requests" value={mine.length} icon={FileCheck2} detail="All booking requests" />
        <StatCard label="Pending Advisor" value={count('pending_advisor')} icon={Clock3} tone="amber" detail="Awaiting first review" />
        <StatCard label="Pending Dean" value={count('pending_dean')} icon={FileClock} tone="violet" detail="Advisor approved" />
        <StatCard label="Approved" value={count('approved')} icon={CheckCircle2} tone="green" detail="Ready to use" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card className="overflow-hidden">
          <SectionTitle title="Recent requests" link="/bookings" />
          {mine.length ? <BookingTable bookings={mine.slice(0, 4)} /> : <EmptyState />}
        </Card>
        <Card className="overflow-hidden">
          <SectionTitle title="Upcoming approved booking" link="/calendar" linkLabel="Calendar" />
          {upcoming ? (
            <div className="p-4 sm:p-5">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mfu-700 to-mfu-900 p-4 text-white shadow-lg shadow-mfu-900/15 sm:p-5">
                <div className="brand-stripe absolute inset-x-0 top-0 h-1" aria-hidden="true" />
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-white/12"><CalendarCheck2 size={21} /></span>
                  <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-semibold text-emerald-200">Confirmed</span>
                </div>
                <p className="mt-8 text-3xl font-bold tracking-tight">{upcoming.pcId}</p>
                <p className="mt-1 text-sm text-emerald-100/75">{upcoming.room}</p>
                <div className="mt-5 border-t border-white/15 pt-4 text-sm">
                  <p className="font-semibold">{formatBookingDateRange(upcoming)}</p>
                  <p className="mt-1 text-emerald-100/75">{formatBookingTime(upcoming)}</p>
                </div>
              </div>
            </div>
          ) : <EmptyState title="No approved booking" description="Your next approved booking will appear here." />}
        </Card>
      </div>
    </div>
  )
}

function ReviewerDashboard({ role }) {
  const { user, bookings } = useApp()
  const isAdvisor = role === 'advisor'
  const pendingStatus = isAdvisor ? 'pending_advisor' : 'pending_dean'
  const pending = bookings.filter((booking) => booking.status === pendingStatus)
  const today = format(new Date(), 'yyyy-MM-dd')
  const approved = bookings.filter((booking) => isAdvisor ? booking.advisorDecisionAt?.startsWith(today) : booking.deanDecision === 'approved')
  const rejected = bookings.filter((booking) => booking.rejectedBy === role)

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${isAdvisor ? 'Advisor' : 'Dean'} dashboard`} title={`Good morning, ${user.shortName || user.name}`} description={isAdvisor ? 'Review student requests and forward eligible bookings for final approval.' : 'Complete the final review for advisor-approved PC bookings.'} action={<Link to="/requests/pending"><Button>Review pending <ArrowRight size={17} /></Button></Link>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending Requests" value={pending.length} icon={FileClock} tone="amber" detail="Needs your review" />
        <StatCard label={isAdvisor ? 'Approved Today' : 'Approved Bookings'} value={approved.length} icon={CheckCircle2} tone="green" detail={isAdvisor ? 'Forwarded to dean today' : 'Final approval given'} />
        <StatCard label="Rejected Requests" value={rejected.length} icon={FileX2} tone="red" detail="Reason recorded" />
      </div>
      <Card className="overflow-hidden">
        <SectionTitle title="Requests requiring attention" link="/requests/pending" />
        {pending.length ? <BookingTable bookings={pending.slice(0, 5)} showStudent showAdvisor={!isAdvisor} /> : <EmptyState title="You're all caught up" description="No booking requests currently need your review." />}
      </Card>
      <Card className="overflow-hidden">
        <SectionTitle title="Recent requests" link="/requests/history" linkLabel="View history" />
        <div className="divide-y divide-slate-100">
          {bookings.slice(0, 4).map((booking) => (
            <Link key={booking.id} to={`/bookings/${booking.id}`} className="flex flex-col items-start gap-3 px-4 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{booking.studentName} · {booking.pcId}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{formatBookingDateRange(booking)} · {formatBookingTime(booking)}</p>
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
