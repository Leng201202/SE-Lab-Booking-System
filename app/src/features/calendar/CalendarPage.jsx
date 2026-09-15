import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Monitor,
  ShieldAlert,
} from 'lucide-react'
import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
} from 'date-fns'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import { mockPcs } from '../../data/mockPcs'
import { bookingOccursOnDate, formatBookingTime, getBookingTimeBounds } from '../../utils/booking'

const BLOCKING_STATUSES = ['pending_advisor', 'pending_dean', 'approved']
const LAB_OPEN_MINUTES = 8 * 60
const LAB_CLOSE_MINUTES = 18 * 60
const LAB_DURATION = LAB_CLOSE_MINUTES - LAB_OPEN_MINUTES
const TIMELINE_SLOT_MINUTES = 15
const TIMELINE_SLOT_COUNT = LAB_DURATION / TIMELINE_SLOT_MINUTES
const TIMELINE_ROW_HEIGHT = 72
const HOUR_MARKS = Array.from({ length: 11 }, (_, index) => 8 + index)

const BOOKING_STYLES = {
  pending_advisor: {
    label: 'Pending advisor',
    className: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
    dot: 'bg-amber-500',
  },
  pending_dean: {
    label: 'Pending dean',
    className: 'border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100',
    dot: 'bg-violet-500',
  },
  approved: {
    label: 'Booked',
    className: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100',
    dot: 'bg-blue-600',
  },
}

function getActiveBookings(bookings, pcId, date) {
  const dateKey = format(date, 'yyyy-MM-dd')
  return bookings
    .filter(
      (booking) =>
        booking.pcId === pcId &&
        bookingOccursOnDate(booking, dateKey) &&
        BLOCKING_STATUSES.includes(booking.status),
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function getTimelineGridPosition(startTime, endTime) {
  const start = Math.max(timeToMinutes(startTime), LAB_OPEN_MINUTES)
  const end = Math.min(timeToMinutes(endTime), LAB_CLOSE_MINUTES)
  if (end <= start) return null
  return {
    gridColumn: `${Math.floor((start - LAB_OPEN_MINUTES) / TIMELINE_SLOT_MINUTES) + 1} / ${Math.ceil((end - LAB_OPEN_MINUTES) / TIMELINE_SLOT_MINUTES) + 1}`,
    gridRow: '1',
  }
}

function weekLabel(days) {
  const first = days[0]
  const last = days[days.length - 1]
  if (format(first, 'MMM yyyy') === format(last, 'MMM yyyy')) {
    return `${format(first, 'd')}–${format(last, 'd MMMM yyyy')}`
  }
  return `${format(first, 'd MMM')}–${format(last, 'd MMM yyyy')}`
}

function PcLabel({ pc }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
        <Monitor size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-5 text-slate-900">{pc.id}</p>
        <p className="flex items-center gap-1 truncate text-[10px] font-medium text-slate-400">
          <MapPin size={10} />{pc.room}
        </p>
      </div>
    </div>
  )
}

function BookingContent({ booking }) {
  const style = BOOKING_STYLES[booking.status]
  return (
    <>
      <span className="flex items-center gap-1.5 truncate font-bold">
        <span className={`size-1.5 shrink-0 rounded-full ${style.dot}`} />
        {style.label}
      </span>
      <span className="mt-1 flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold opacity-80">
        <Clock3 size={10} />{formatBookingTime(booking)}
      </span>
    </>
  )
}

function AvailabilityCell({ pc, date, bookings, canOpenAll, userId }) {
  if (pc.status === 'Maintenance') {
    return (
      <div className="flex min-h-20 flex-col items-center justify-center rounded-lg border border-red-100 bg-red-50/70 px-2 text-center">
        <ShieldAlert size={17} className="text-red-500" />
        <span className="mt-1.5 text-xs font-bold text-red-700">Maintenance</span>
        <span className="mt-0.5 text-[10px] text-red-500">Unavailable</span>
      </div>
    )
  }

  const activeBookings = getActiveBookings(bookings, pc.id, date)
  if (!activeBookings.length) {
    return (
      <div className="flex min-h-20 flex-col items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50/50 px-2 text-center">
        <span className="size-2 rounded-full bg-emerald-500" />
        <span className="mt-2 text-xs font-bold text-emerald-700">Available</span>
        <span className="mt-0.5 text-[10px] text-emerald-600">All day</span>
      </div>
    )
  }

  return (
    <div className="min-h-20 space-y-1.5">
      {activeBookings.map((booking) => {
        const style = BOOKING_STYLES[booking.status]
        const canOpen = canOpenAll || booking.studentId === userId
        return canOpen ? (
          <Link key={booking.id} to={`/bookings/${booking.id}`} className={`block rounded-lg border p-2 text-[11px] transition ${style.className}`} title={`Open ${booking.id}`}>
            <BookingContent booking={booking} />
          </Link>
        ) : (
          <div key={booking.id} className={`rounded-lg border p-2 text-[11px] ${style.className}`}>
            <BookingContent booking={booking} />
          </div>
        )
      })}
      <p className="px-1 pt-1 text-center text-[10px] font-medium text-emerald-600">Available at other times</p>
    </div>
  )
}

function WeekView({ weekDays, bookings, canOpenAll, userId, openTimeline }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-48 border-b border-r border-slate-200 bg-white px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">Workstation</th>
            {weekDays.map((day) => (
              <th key={day.toISOString()} className={`min-w-32 border-b border-slate-200 p-0 text-center ${isToday(day) ? 'bg-mfu-50' : 'bg-white'}`}>
                <button className="w-full px-3 py-3 hover:bg-mfu-50" onClick={() => openTimeline(day)} title={`Open timeline for ${format(day, 'd MMMM yyyy')}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isToday(day) ? 'text-mfu-600' : 'text-slate-400'}`}>{format(day, 'EEE')}</p>
                  <p className={`mt-1 text-lg font-bold ${isToday(day) ? 'text-mfu-800' : 'text-slate-800'}`}>{format(day, 'd')}</p>
                  {isToday(day) && <span className="mt-1 inline-flex rounded-full bg-mfu-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Today</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockPcs.map((pc) => (
            <tr key={pc.id}>
              <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-5 py-4 align-top"><PcLabel pc={pc} /></th>
              {weekDays.map((day) => (
                <td key={day.toISOString()} className={`border-b border-slate-100 p-2 align-top ${isToday(day) ? 'bg-mfu-50/40' : 'bg-white'}`}>
                  <AvailabilityCell pc={pc} date={day} bookings={bookings} canOpenAll={canOpenAll} userId={userId} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TimelineBlock({ booking, canOpen }) {
  const bookingTime = getBookingTimeBounds(booking)
  const position = getTimelineGridPosition(bookingTime.startTime, bookingTime.endTime)
  if (!position) return null
  const style = BOOKING_STYLES[booking.status]
  const className = `z-[2] mx-1 h-12 self-center overflow-hidden rounded-lg border px-2.5 py-1.5 text-[11px] transition ${style.className}`
  const content = <BookingContent booking={booking} />

  return canOpen ? (
    <Link to={`/bookings/${booking.id}`} className={className} style={position} title={`Open ${booking.id}`}>{content}</Link>
  ) : (
    <div className={className} style={position}>{content}</div>
  )
}

function TimelineView({ date, bookings, canOpenAll, userId }) {
  return (
    <div className="flex w-full bg-white">
      <div className="w-40 shrink-0 border-r border-slate-200 bg-white sm:w-48">
        <div className="flex h-12 items-center border-b border-slate-200 bg-slate-50 px-3 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:px-4 sm:text-xs">Workstations <span className="ml-1 text-slate-400">({mockPcs.length})</span></div>
        {mockPcs.map((pc) => (
          <div key={pc.id} className="flex items-center border-b border-slate-100 px-3 sm:px-4" style={{ height: `${TIMELINE_ROW_HEIGHT}px` }}>
            <PcLabel pc={pc} />
          </div>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto" aria-label={`PC timeline for ${format(date, 'd MMMM yyyy')}`}>
        <div className="min-w-[900px]">
          <div className="relative h-12 border-b border-slate-200 bg-slate-50">
            {HOUR_MARKS.map((hour, index) => (
              <span key={hour} className="absolute top-3.5 text-[10px] font-semibold text-slate-500" style={{ left: `${(index / (HOUR_MARKS.length - 1)) * 100}%`, transform: index === 0 ? 'none' : index === HOUR_MARKS.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)' }}>
                {String(hour).padStart(2, '0')}:00
              </span>
            ))}
          </div>

          {mockPcs.map((pc) => {
            const activeBookings = getActiveBookings(bookings, pc.id, date)
            return (
              <div
                key={pc.id}
                className="border-b border-slate-100 bg-white"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${TIMELINE_SLOT_COUNT}, minmax(22.5px, 1fr))`,
                  gridTemplateRows: `${TIMELINE_ROW_HEIGHT}px`,
                  backgroundImage: 'linear-gradient(to right, rgb(241 245 249) 1px, transparent 1px)',
                  backgroundSize: '10% 100%',
                }}
              >
                {pc.status === 'Maintenance' ? (
                  <div className="mx-2 my-2.5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700" style={{ gridColumn: '1 / -1', gridRow: '1' }}><ShieldAlert size={15} />Maintenance · unavailable all day</div>
                ) : (
                  <>
                    {!activeBookings.length && <div className="flex items-center px-3" style={{ gridColumn: '1 / -1', gridRow: '1' }}><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200"><span className="size-1.5 rounded-full bg-emerald-500" />Available all day</span></div>}
                    {activeBookings.map((booking) => <TimelineBlock key={booking.id} booking={booking} canOpen={canOpenAll || booking.studentId === userId} />)}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ViewToggle({ view, setView }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-200/70 p-1" role="group" aria-label="Calendar view">
      <button onClick={() => setView('week')} aria-pressed={view === 'week'} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Week</button>
      <button onClick={() => setView('timeline')} aria-pressed={view === 'timeline'} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${view === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Timeline</button>
    </div>
  )
}

function CalendarLegend() {
  const items = [
    { label: 'Available', dot: 'bg-emerald-500', classes: 'border-emerald-100 bg-emerald-50/60 text-emerald-800' },
    { label: 'Pending advisor', dot: 'bg-amber-500', classes: 'border-amber-100 bg-amber-50/60 text-amber-800' },
    { label: 'Pending dean', dot: 'bg-violet-500', classes: 'border-violet-100 bg-violet-50/60 text-violet-800' },
    { label: 'Booked', dot: 'bg-blue-600', classes: 'border-blue-100 bg-blue-50/60 text-blue-800' },
    { label: 'Maintenance', dot: 'bg-red-500', classes: 'border-red-100 bg-red-50/60 text-red-800' },
  ]
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50/70 px-4 py-2.5 sm:px-5">
      {items.map((item) => (
        <span key={item.label} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.classes}`}>
          <span className={`size-1.5 rounded-full ${item.dot}`} />{item.label}
        </span>
      ))}
    </div>
  )
}

export function CalendarPage() {
  const { user, bookings } = useApp()
  const [view, setView] = useState('week')
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const weekDays = useMemo(() => {
    const start = startOfWeek(anchorDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end: endOfWeek(start, { weekStartsOn: 1 }) })
  }, [anchorDate])
  const canOpenAll = user.role === 'advisor' || user.role === 'dean'

  const changeView = (nextView) => {
    if (nextView === 'week') setAnchorDate(selectedDate)
    setView(nextView)
  }
  const openTimeline = (day) => {
    setSelectedDate(day)
    setView('timeline')
  }
  const movePeriod = (amount) => {
    if (view === 'week') setAnchorDate((date) => addWeeks(date, amount))
    else setSelectedDate((date) => addDays(date, amount))
  }
  const goToday = () => {
    const today = new Date()
    setAnchorDate(today)
    setSelectedDate(today)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Lab availability"
        title="PC booking calendar"
        description="Check every workstation by week or exact booking time."
        action={<ViewToggle view={view} setView={changeView} />}
      />

      <Card className="overflow-hidden shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-mfu-50 text-mfu-700"><CalendarDays size={17} /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{view === 'week' ? 'Selected week' : 'Day timeline · 08:00–18:00'}</p>
              <h2 className="mt-0.5 text-sm font-bold text-slate-900">{view === 'week' ? weekLabel(weekDays) : format(selectedDate, 'EEEE, d MMMM yyyy')}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => movePeriod(-1)} aria-label={view === 'week' ? 'Previous week' : 'Previous day'}><ChevronLeft size={17} /><span className="hidden sm:inline">Previous</span></Button>
            <Button variant="secondary" size="sm" onClick={goToday}>Today</Button>
            <Button variant="secondary" size="sm" onClick={() => movePeriod(1)} aria-label={view === 'week' ? 'Next week' : 'Next day'}><span className="hidden sm:inline">Next</span><ChevronRight size={17} /></Button>
          </div>
        </div>

        <CalendarLegend />

        {view === 'week' ? (
          <WeekView weekDays={weekDays} bookings={bookings} canOpenAll={canOpenAll} userId={user.id} openTimeline={openTimeline} />
        ) : (
          <TimelineView date={selectedDate} bookings={bookings} canOpenAll={canOpenAll} userId={user.id} />
        )}

        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[11px] leading-5 text-slate-500">
          {view === 'week' ? 'Select a date heading to open its detailed timeline. ' : 'Scroll horizontally to see all lab hours. '}
          Rejected, cancelled, and completed requests do not block availability.
        </div>
      </Card>
    </div>
  )
}
