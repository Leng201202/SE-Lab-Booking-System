import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MousePointer2,
  Monitor,
  ShieldAlert,
  X,
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
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../app/AppContext'
import { Button } from '../../components/ui/Button'
import { Card, PageHeader } from '../../components/ui/Card'
import {
  BLOCKING_BOOKING_STATUSES,
  bookingOccursOnDate,
  formatBookingTime,
  getBangkokDateKey,
  getBookingTimeBounds,
  getEarliestBookableTime,
} from '../../utils/booking'

const LAB_OPEN_MINUTES = 8 * 60
const LAB_CLOSE_MINUTES = 18 * 60
const LAB_DURATION = LAB_CLOSE_MINUTES - LAB_OPEN_MINUTES
const TIMELINE_SLOT_MINUTES = 15
const TIMELINE_SLOT_COUNT = LAB_DURATION / TIMELINE_SLOT_MINUTES
const TIMELINE_ROW_HEIGHT = 72
const HOUR_MARKS = Array.from({ length: 11 }, (_, index) => 8 + index)

const BOOKING_STYLES = {
  pending_technician: {
    label: 'Pending technician',
    className: 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100',
    dot: 'bg-sky-500',
  },
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
        BLOCKING_BOOKING_STATUSES.includes(booking.status),
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function overlapsBooking(activeBookings, startMinutes, endMinutes) {
  return activeBookings.some((booking) => {
    const bounds = getBookingTimeBounds(booking)
    return startMinutes < timeToMinutes(bounds.endTime) && endMinutes > timeToMinutes(bounds.startTime)
  })
}

function hasAvailableLabSlot(activeBookings, minimumStartMinutes = LAB_OPEN_MINUTES) {
  return Array.from({ length: TIMELINE_SLOT_COUNT }, (_, slotIndex) => {
    const start = LAB_OPEN_MINUTES + slotIndex * TIMELINE_SLOT_MINUTES
    return start >= minimumStartMinutes && !overlapsBooking(activeBookings, start, start + TIMELINE_SLOT_MINUTES)
  }).some(Boolean)
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function createSelection(pcId, date, startSlot, endSlot) {
  return {
    pcId,
    date: format(date, 'yyyy-MM-dd'),
    startTime: minutesToTime(LAB_OPEN_MINUTES + startSlot * TIMELINE_SLOT_MINUTES),
    endTime: minutesToTime(LAB_OPEN_MINUTES + endSlot * TIMELINE_SLOT_MINUTES),
  }
}

function timeToSlot(time) {
  return (timeToMinutes(time) - LAB_OPEN_MINUTES) / TIMELINE_SLOT_MINUTES
}

function formatSelectionDuration(selection) {
  const minutes = timeToMinutes(selection.endTime) - timeToMinutes(selection.startTime)
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (!hours) return `${remainder} min`
  if (!remainder) return `${hours} hr${hours === 1 ? '' : 's'}`
  return `${hours} hr ${remainder} min`
}

function getSuggestedSelection(pcId, date, slotIndex, activeBookings) {
  const startMinutes = LAB_OPEN_MINUTES + slotIndex * TIMELINE_SLOT_MINUTES
  const nextBookingStart = activeBookings
    .map((booking) => timeToMinutes(getBookingTimeBounds(booking).startTime))
    .filter((minutes) => minutes > startMinutes)
    .sort((a, b) => a - b)[0]
  const endMinutes = Math.min(startMinutes + 60, nextBookingStart || LAB_CLOSE_MINUTES, LAB_CLOSE_MINUTES)

  return createSelection(
    pcId,
    date,
    slotIndex,
    (endMinutes - LAB_OPEN_MINUTES) / TIMELINE_SLOT_MINUTES,
  )
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

function dateFromBangkokKey(dateKey) {
  return new Date(`${dateKey}T00:00:00`)
}

function PcLabel({ pc }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="hidden size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 sm:grid">
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

function AvailabilityCell({ pc, date, bookings, canBook, minimumStartMinutes, onChooseTime }) {
  if (pc.status !== 'Available') {
    const isMaintenance = pc.status === 'Maintenance'
    return (
      <div className={`flex min-h-20 flex-col items-center justify-center rounded-lg border px-2 text-center ${isMaintenance ? 'border-red-100 bg-red-50/70' : 'border-slate-200 bg-slate-100/80'}`}>
        <ShieldAlert size={17} className={isMaintenance ? 'text-red-500' : 'text-slate-500'} />
        <span className={`mt-1.5 text-xs font-bold ${isMaintenance ? 'text-red-700' : 'text-slate-700'}`}>{pc.status}</span>
        <span className={`mt-0.5 text-[10px] ${isMaintenance ? 'text-red-500' : 'text-slate-500'}`}>Unavailable</span>
      </div>
    )
  }

  const activeBookings = getActiveBookings(bookings, pc.id, date)
  if (!activeBookings.length) {
    const dateKey = format(date, 'yyyy-MM-dd')
    const unavailableLabel = dateKey === getBangkokDateKey() ? 'No future time' : 'Past date'
    const content = (
      <>
        <span className={`size-2 rounded-full ${canBook ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        <span className={`mt-2 text-xs font-bold ${canBook ? 'text-emerald-700' : 'text-slate-600'}`}>{canBook ? 'Available' : 'Read only'}</span>
        <span className={`mt-0.5 text-[10px] ${canBook ? 'text-emerald-600' : 'text-slate-500'}`}>{canBook ? 'Choose a time' : unavailableLabel}</span>
      </>
    )
    return canBook ? (
      <button onClick={onChooseTime} className="flex min-h-20 w-full flex-col items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/60 px-2 text-center transition hover:border-emerald-300 hover:bg-emerald-100/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mfu-600" aria-label={`Choose a booking time for ${pc.id} on ${format(date, 'd MMMM yyyy')}`}>
        {content}
      </button>
    ) : (
      <div className="flex min-h-20 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-2 text-center">{content}</div>
    )
  }

  const hasOpenTime = hasAvailableLabSlot(activeBookings, minimumStartMinutes)
  const canChooseTime = canBook && hasOpenTime

  return (
    <div className="min-h-20 space-y-1.5">
      {activeBookings.map((booking) => {
        const style = BOOKING_STYLES[booking.status]
        const canOpen = booking.canViewDetails
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
      {canChooseTime ? (
        <button onClick={onChooseTime} className="flex w-full items-center justify-center gap-1 rounded-md px-1 py-1 text-[10px] font-bold text-mfu-700 transition hover:bg-mfu-50 focus-visible:outline-2 focus-visible:outline-mfu-600">
          Choose another time <ArrowRight size={11} />
        </button>
      ) : (
        <p className={`px-1 pt-1 text-center text-[10px] font-medium ${hasOpenTime ? 'text-emerald-600' : 'text-slate-500'}`}>{hasOpenTime ? 'Available at other times' : 'No open lab time'}</p>
      )}
    </div>
  )
}

function WeekView({ weekDays, bookings, pcs, openTimeline, currentTime }) {
  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <table className="w-full min-w-[960px] border-separate border-spacing-0 text-left sm:min-w-[1120px]">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-28 min-w-28 border-b border-r border-slate-200 bg-white px-3 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:w-48 sm:min-w-48 sm:px-5 sm:text-xs"><span className="sm:hidden">PC</span><span className="hidden sm:inline">Workstation</span></th>
            {weekDays.map((day) => (
              <th key={day.toISOString()} className={`min-w-28 border-b border-slate-200 p-0 text-center sm:min-w-32 ${isToday(day) ? 'bg-mfu-50' : 'bg-white'}`}>
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
          {pcs.map((pc) => (
            <tr key={pc.id}>
              <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-4 align-top sm:px-5"><PcLabel pc={pc} /></th>
              {weekDays.map((day) => {
                const earliestTime = getEarliestBookableTime(format(day, 'yyyy-MM-dd'), currentTime)
                return (
                  <td key={day.toISOString()} className={`border-b border-slate-100 p-2 align-top ${isToday(day) ? 'bg-mfu-50/40' : 'bg-white'}`}>
                    <AvailabilityCell
                      pc={pc}
                      date={day}
                      bookings={bookings}
                      canBook={Boolean(earliestTime)}
                      minimumStartMinutes={earliestTime ? timeToMinutes(earliestTime) : LAB_CLOSE_MINUTES}
                      onChooseTime={() => openTimeline(day, pc.id)}
                    />
                  </td>
                )
              })}
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

function TimelineSelection({ selection, date, activeBookings, minimumStartSlot, onChange }) {
  const drag = useRef(null)
  const startSlot = timeToSlot(selection.startTime)
  const endSlot = timeToSlot(selection.endTime)

  const startDrag = (mode, event) => {
    if (event.button !== undefined && event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    const row = event.currentTarget.closest('[data-timeline-row]')
    if (!row) return
    drag.current = {
      mode,
      pointerId: event.pointerId,
      pointerStartX: event.clientX,
      rowWidth: row.getBoundingClientRect().width,
      startSlot,
      endSlot,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const moveSelection = (event) => {
    const interaction = drag.current
    if (!interaction || interaction.pointerId !== event.pointerId) return
    event.preventDefault()
    const slotWidth = interaction.rowWidth / TIMELINE_SLOT_COUNT
    const slotDelta = Math.round((event.clientX - interaction.pointerStartX) / slotWidth)
    let nextStart = interaction.startSlot
    let nextEnd = interaction.endSlot

    if (interaction.mode === 'move') {
      const duration = interaction.endSlot - interaction.startSlot
      nextStart = clamp(interaction.startSlot + slotDelta, minimumStartSlot, TIMELINE_SLOT_COUNT - duration)
      nextEnd = nextStart + duration
    } else if (interaction.mode === 'start') {
      nextStart = clamp(interaction.startSlot + slotDelta, minimumStartSlot, interaction.endSlot - 1)
    } else {
      nextEnd = clamp(interaction.endSlot + slotDelta, interaction.startSlot + 1, TIMELINE_SLOT_COUNT)
    }

    const startMinutes = LAB_OPEN_MINUTES + nextStart * TIMELINE_SLOT_MINUTES
    const endMinutes = LAB_OPEN_MINUTES + nextEnd * TIMELINE_SLOT_MINUTES
    if (!overlapsBooking(activeBookings, startMinutes, endMinutes)) {
      onChange(createSelection(selection.pcId, date, nextStart, nextEnd))
    }
  }

  const stopDrag = (event) => {
    if (drag.current?.pointerId !== event.pointerId) return
    drag.current = null
  }

  const moveWithKeyboard = (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const direction = event.key === 'ArrowLeft' ? -1 : 1
    const duration = endSlot - startSlot
    const nextStart = clamp(startSlot + direction, minimumStartSlot, TIMELINE_SLOT_COUNT - duration)
    const nextEnd = nextStart + duration
    const startMinutes = LAB_OPEN_MINUTES + nextStart * TIMELINE_SLOT_MINUTES
    const endMinutes = LAB_OPEN_MINUTES + nextEnd * TIMELINE_SLOT_MINUTES
    if (!overlapsBooking(activeBookings, startMinutes, endMinutes)) {
      onChange(createSelection(selection.pcId, date, nextStart, nextEnd))
    }
  }

  return (
    <div
      className="group pointer-events-auto z-[3] my-2 flex cursor-grab touch-none select-none items-center justify-between overflow-visible rounded-lg border-2 border-mfu-600 bg-mfu-100/95 text-[10px] font-bold text-mfu-900 shadow-md active:cursor-grabbing"
      style={getTimelineGridPosition(selection.startTime, selection.endTime)}
      onPointerDown={(event) => startDrag('move', event)}
      onPointerMove={moveSelection}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onKeyDown={moveWithKeyboard}
      role="button"
      tabIndex={0}
      aria-label={`Selected ${selection.pcId} from ${selection.startTime} to ${selection.endTime}. Drag to move or use left and right arrow keys.`}
      title="Drag to move · drag either edge to resize"
    >
      <button
        type="button"
        className="-ml-2 h-10 w-4 shrink-0 cursor-ew-resize touch-none rounded-full border-2 border-white bg-mfu-700 shadow transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mfu-800"
        onPointerDown={(event) => startDrag('start', event)}
        aria-label="Drag to change start time"
      />
      <span className="pointer-events-none truncate px-1">{selection.startTime}–{selection.endTime}</span>
      <button
        type="button"
        className="-mr-2 h-10 w-4 shrink-0 cursor-ew-resize touch-none rounded-full border-2 border-white bg-mfu-700 shadow transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-mfu-800"
        onPointerDown={(event) => startDrag('end', event)}
        aria-label="Drag to change end time"
      />
    </div>
  )
}

function TimelineView({ date, bookings, pcs, earliestBookableTime, selection, onSelect }) {
  const createDrag = useRef(null)
  const canBook = Boolean(earliestBookableTime)
  const dateKey = format(date, 'yyyy-MM-dd')
  const readOnlyLabel = dateKey < getBangkokDateKey() ? 'Past date · read only' : 'No future time remains today'
  const minimumStartMinutes = earliestBookableTime ? timeToMinutes(earliestBookableTime) : LAB_CLOSE_MINUTES
  const minimumStartSlot = clamp(
    Math.ceil((minimumStartMinutes - LAB_OPEN_MINUTES) / TIMELINE_SLOT_MINUTES),
    0,
    TIMELINE_SLOT_COUNT,
  )

  const startSlotSelection = (event, pcId, slotIndex, activeBookings) => {
    if (event.button !== undefined && event.button !== 0) return
    const row = event.currentTarget.closest('[data-timeline-row]')
    if (!row) return
    event.preventDefault()
    createDrag.current = {
      pointerId: event.pointerId,
      pcId,
      originSlot: slotIndex,
      currentSlot: slotIndex,
      moved: false,
      rowBounds: row.getBoundingClientRect(),
      activeBookings,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    onSelect(createSelection(pcId, date, slotIndex, slotIndex + 1))
  }

  const extendSlotSelection = (event) => {
    const interaction = createDrag.current
    if (!interaction || interaction.pointerId !== event.pointerId) return
    event.preventDefault()
    const relativeX = event.clientX - interaction.rowBounds.left
    const pointerSlot = clamp(
      Math.floor(relativeX / (interaction.rowBounds.width / TIMELINE_SLOT_COUNT)),
      0,
      TIMELINE_SLOT_COUNT - 1,
    )
    if (pointerSlot === interaction.currentSlot) return
    interaction.currentSlot = pointerSlot
    interaction.moved = true
    const nextStart = Math.max(minimumStartSlot, Math.min(interaction.originSlot, pointerSlot))
    const nextEnd = Math.max(interaction.originSlot, pointerSlot) + 1
    const startMinutes = LAB_OPEN_MINUTES + nextStart * TIMELINE_SLOT_MINUTES
    const endMinutes = LAB_OPEN_MINUTES + nextEnd * TIMELINE_SLOT_MINUTES
    if (!overlapsBooking(interaction.activeBookings, startMinutes, endMinutes)) {
      onSelect(createSelection(interaction.pcId, date, nextStart, nextEnd))
    }
  }

  const finishSlotSelection = (event) => {
    const interaction = createDrag.current
    if (!interaction || interaction.pointerId !== event.pointerId) return
    if (!interaction.moved) {
      onSelect(getSuggestedSelection(interaction.pcId, date, interaction.originSlot, interaction.activeBookings))
    }
    createDrag.current = null
  }

  return (
    <div className="flex w-full bg-white">
      <div className="w-28 shrink-0 border-r border-slate-200 bg-white sm:w-48">
        <div className="flex h-12 items-center border-b border-slate-200 bg-slate-50 px-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:px-4 sm:text-xs"><span className="sm:hidden">PCs</span><span className="hidden sm:inline">Workstations</span> <span className="ml-1 text-slate-400">({pcs.length})</span></div>
        {pcs.map((pc) => (
          <div key={pc.id} className="flex items-center border-b border-slate-100 px-2 sm:px-4" style={{ height: `${TIMELINE_ROW_HEIGHT}px` }}>
            <PcLabel pc={pc} />
          </div>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain" aria-label={`PC timeline for ${format(date, 'd MMMM yyyy')}`}>
        <div className="min-w-[900px]">
          <div className="relative h-12 border-b border-slate-200 bg-slate-50">
            {HOUR_MARKS.map((hour, index) => (
              <span key={hour} className="absolute top-3.5 text-[10px] font-semibold text-slate-500" style={{ left: `${(index / (HOUR_MARKS.length - 1)) * 100}%`, transform: index === 0 ? 'none' : index === HOUR_MARKS.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)' }}>
                {String(hour).padStart(2, '0')}:00
              </span>
            ))}
          </div>

          {pcs.map((pc) => {
            const activeBookings = getActiveBookings(bookings, pc.id, date)
            const isSelectedPc = selection?.pcId === pc.id
            return (
              <div
                key={pc.id}
                data-timeline-row={pc.id}
                className={`border-b border-slate-100 ${isSelectedPc ? 'bg-mfu-50/30' : 'bg-white'}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${TIMELINE_SLOT_COUNT}, minmax(22.5px, 1fr))`,
                  gridTemplateRows: `${TIMELINE_ROW_HEIGHT}px`,
                  backgroundImage: 'linear-gradient(to right, rgb(241 245 249) 1px, transparent 1px)',
                  backgroundSize: '10% 100%',
                }}
              >
                {pc.status !== 'Available' ? (
                  <div className={`mx-2 my-2.5 flex items-center gap-2 rounded-lg border px-3 text-xs font-semibold ${pc.status === 'Maintenance' ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-100 text-slate-700'}`} style={{ gridColumn: '1 / -1', gridRow: '1' }}><ShieldAlert size={15} />{pc.status} · unavailable all day</div>
                ) : (
                  <>
                    {canBook && Array.from({ length: TIMELINE_SLOT_COUNT }, (_, slotIndex) => {
                      const slotStart = LAB_OPEN_MINUTES + slotIndex * TIMELINE_SLOT_MINUTES
                      const slotEnd = slotStart + TIMELINE_SLOT_MINUTES
                      const isPast = slotStart < minimumStartMinutes
                      const available = !isPast && !overlapsBooking(activeBookings, slotStart, slotEnd)
                      return (
                        <button
                          key={slotIndex}
                          type="button"
                          disabled={!available}
                          onPointerDown={(event) => startSlotSelection(event, pc.id, slotIndex, activeBookings)}
                          onPointerMove={extendSlotSelection}
                          onPointerUp={finishSlotSelection}
                          onPointerCancel={finishSlotSelection}
                          className="z-0 h-full touch-pan-y transition hover:bg-mfu-100/60 focus-visible:z-[4] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-mfu-600 disabled:cursor-not-allowed disabled:bg-slate-100/70"
                          style={{ gridColumn: `${slotIndex + 1}`, gridRow: '1' }}
                          aria-label={isPast ? `${pc.id} is in the past at ${minutesToTime(slotStart)}` : available ? `Select ${pc.id} at ${minutesToTime(slotStart)}` : `${pc.id} unavailable at ${minutesToTime(slotStart)}`}
                        />
                      )
                    })}
                    {!activeBookings.length && !canBook && <div className="flex items-center px-3" style={{ gridColumn: '1 / -1', gridRow: '1' }}><span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200"><span className="size-1.5 rounded-full bg-slate-400" />{readOnlyLabel}</span></div>}
                    {isSelectedPc && (
                      <TimelineSelection selection={selection} date={date} activeBookings={activeBookings} minimumStartSlot={minimumStartSlot} onChange={onSelect} />
                    )}
                    {activeBookings.map((booking) => <TimelineBlock key={booking.id} booking={booking} canOpen={booking.canViewDetails} />)}
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
    <div className="inline-flex w-full rounded-lg bg-slate-200/70 p-1 sm:w-auto" role="group" aria-label="Calendar view">
      <button onClick={() => setView('week')} aria-pressed={view === 'week'} className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition sm:flex-none ${view === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Week</button>
      <button onClick={() => setView('timeline')} aria-pressed={view === 'timeline'} className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition sm:flex-none ${view === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Timeline</button>
    </div>
  )
}

function CalendarLegend() {
  const items = [
    { label: 'Available', dot: 'bg-emerald-500', classes: 'border-emerald-100 bg-emerald-50/60 text-emerald-800' },
    { label: 'Pending technician', dot: 'bg-sky-500', classes: 'border-sky-100 bg-sky-50/60 text-sky-800' },
    { label: 'Pending advisor', dot: 'bg-amber-500', classes: 'border-amber-100 bg-amber-50/60 text-amber-800' },
    { label: 'Pending dean', dot: 'bg-violet-500', classes: 'border-violet-100 bg-violet-50/60 text-violet-800' },
    { label: 'Booked', dot: 'bg-blue-600', classes: 'border-blue-100 bg-blue-50/60 text-blue-800' },
    { label: 'Maintenance', dot: 'bg-red-500', classes: 'border-red-100 bg-red-50/60 text-red-800' },
  ]
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50/70 px-4 py-2.5 sm:flex-wrap sm:px-5">
      {items.map((item) => (
        <span key={item.label} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.classes}`}>
          <span className={`size-1.5 rounded-full ${item.dot}`} />{item.label}
        </span>
      ))}
    </div>
  )
}

export function CalendarPage() {
  const { calendarBookings: bookings, pcs, refreshCalendar } = useApp()
  const [view, setView] = useState('week')
  const [anchorDate, setAnchorDate] = useState(() => dateFromBangkokKey(getBangkokDateKey()))
  const [selectedDate, setSelectedDate] = useState(() => dateFromBangkokKey(getBangkokDateKey()))
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [selection, setSelection] = useState(null)
  const [preferredPcId, setPreferredPcId] = useState(null)
  const [calendarError, setCalendarError] = useState('')
  const weekDays = useMemo(() => {
    const start = startOfWeek(anchorDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end: endOfWeek(start, { weekStartsOn: 1 }) })
  }, [anchorDate])
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')
  const earliestBookableTime = getEarliestBookableTime(selectedDateKey, currentTime)
  const canBook = Boolean(earliestBookableTime)
  const isPastDate = selectedDateKey < getBangkokDateKey(currentTime)
  const activeSelection = selection && earliestBookableTime && selection.startTime >= earliestBookableTime
    ? selection
    : null

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const rangeStart = view === 'week' ? weekDays[0] : selectedDate
    const rangeEnd = view === 'week' ? weekDays[weekDays.length - 1] : selectedDate
    refreshCalendar(format(rangeStart, 'yyyy-MM-dd'), format(rangeEnd, 'yyyy-MM-dd'))
      .then(() => setCalendarError(''))
      .catch((error) => setCalendarError(error.message))
  }, [refreshCalendar, selectedDate, view, weekDays])

  const changeView = (nextView) => {
    if (nextView === 'week') setAnchorDate(selectedDate)
    setSelection(null)
    setPreferredPcId(null)
    setView(nextView)
  }
  const openTimeline = (day, pcId = null) => {
    setSelectedDate(day)
    setSelection(null)
    setPreferredPcId(pcId)
    setView('timeline')
  }
  const movePeriod = (amount) => {
    if (view === 'week') setAnchorDate((date) => addWeeks(date, amount))
    else setSelectedDate((date) => addDays(date, amount))
    setSelection(null)
    setPreferredPcId(null)
  }
  const goToday = () => {
    const today = dateFromBangkokKey(getBangkokDateKey())
    setAnchorDate(today)
    setSelectedDate(today)
    setSelection(null)
    setPreferredPcId(null)
  }

  const bookingSearch = activeSelection
    ? new URLSearchParams({
        pc: activeSelection.pcId,
        date: activeSelection.date,
        start: activeSelection.startTime,
        end: activeSelection.endTime,
        source: 'calendar',
      }).toString()
    : ''

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Lab availability"
        title="PC booking calendar"
        description="Check availability, choose an open time slot, and start a booking directly from the calendar."
        action={<ViewToggle view={view} setView={changeView} />}
      />

      <Card className="overflow-hidden shadow-sm">
        {calendarError && <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{calendarError}</div>}
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-mfu-50 text-mfu-700"><CalendarDays size={17} /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{view === 'week' ? 'Selected week' : 'Day timeline · 08:00–18:00'}</p>
              <h2 className="mt-0.5 text-sm font-bold text-slate-900">{view === 'week' ? weekLabel(weekDays) : format(selectedDate, 'EEEE, d MMMM yyyy')}</h2>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <Button variant="secondary" size="sm" onClick={() => movePeriod(-1)} aria-label={view === 'week' ? 'Previous week' : 'Previous day'}><ChevronLeft size={17} /><span className="hidden sm:inline">Previous</span></Button>
            <Button variant="secondary" size="sm" onClick={goToday}>Today</Button>
            <Button variant="secondary" size="sm" onClick={() => movePeriod(1)} aria-label={view === 'week' ? 'Next week' : 'Next day'}><span className="hidden sm:inline">Next</span><ChevronRight size={17} /></Button>
          </div>
        </div>

        <CalendarLegend />

        {view === 'timeline' && (
          <div className={`flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${activeSelection ? 'border-mfu-200 bg-mfu-50' : 'border-slate-200 bg-white'}`} aria-live="polite">
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${activeSelection ? 'bg-mfu-700 text-white' : 'bg-slate-100 text-slate-500'}`}><MousePointer2 size={16} /></span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {activeSelection ? `${activeSelection.pcId} · ${activeSelection.startTime}–${activeSelection.endTime}` : preferredPcId ? `Choose an available time for ${preferredPcId}` : 'Select an available time slot'}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  {activeSelection ? `${format(selectedDate, 'EEEE, d MMMM yyyy')} · ${formatSelectionDuration(activeSelection)} · Drag the block to move it or drag either edge to resize.` : canBook ? `Drag across an open workstation row from ${earliestBookableTime}. A single click selects one hour when available.` : isPastDate ? 'Past dates are read-only. Choose today or a future date to make a booking.' : 'No booking time remains today. Choose a future date.'}
                </p>
              </div>
            </div>
            {activeSelection && (
              <div className="grid w-full shrink-0 grid-cols-[2.5rem_1fr] items-center gap-2 sm:flex sm:w-auto">
                <button onClick={() => setSelection(null)} className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-800" aria-label="Clear selected time"><X size={17} /></button>
                <Link className="block" to={`/book?${bookingSearch}`}><Button className="w-full sm:w-auto" size="sm">Book selected time <ArrowRight size={16} /></Button></Link>
              </div>
            )}
          </div>
        )}

        {view === 'week' ? (
          <WeekView weekDays={weekDays} bookings={bookings} pcs={pcs} openTimeline={openTimeline} currentTime={currentTime} />
        ) : (
          <TimelineView date={selectedDate} bookings={bookings} pcs={pcs} earliestBookableTime={earliestBookableTime} selection={activeSelection} onSelect={setSelection} />
        )}

        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] leading-5 text-slate-500 sm:px-5">
          {view === 'week' ? 'Select an available cell to choose a booking time, or select a date heading to open its timeline. ' : `${canBook ? 'Drag to select; move the selected block or resize it with the edge handles. ' : 'Scroll horizontally to see all lab hours. '}`}
          Rejected, cancelled, and completed requests do not block availability.
        </div>
      </Card>
    </div>
  )
}
