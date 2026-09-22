import { format, parseISO } from 'date-fns'

export const APP_TIME_ZONE = 'Asia/Bangkok'
export const BLOCKING_BOOKING_STATUSES = Object.freeze(['pending_advisor', 'pending_dean', 'approved'])

export const statusMeta = {
  pending_advisor: { label: 'Pending Advisor', tone: 'amber' },
  pending_dean: { label: 'Pending Dean', tone: 'violet' },
  approved: { label: 'Approved', tone: 'green' },
  rejected: { label: 'Rejected', tone: 'red' },
  cancelled: { label: 'Cancelled', tone: 'slate' },
  completed: { label: 'Completed', tone: 'blue' },
}

export function formatBookingDate(date) {
  return format(parseISO(date), 'EEE, d MMM yyyy')
}

export function getBookingStartDate(booking) {
  return booking.startDate || booking.date
}

export function getBookingEndDate(booking) {
  return booking.endDate || booking.startDate || booking.date
}

export function formatBookingDateRange(booking) {
  const startValue = getBookingStartDate(booking)
  const endValue = getBookingEndDate(booking)
  if (startValue === endValue) return formatBookingDate(startValue)

  const start = parseISO(startValue)
  const end = parseISO(endValue)
  if (format(start, 'MMM yyyy') === format(end, 'MMM yyyy')) {
    return `${format(start, 'd')}–${format(end, 'd MMM yyyy')}`
  }
  return `${format(start, 'd MMM')}–${format(end, 'd MMM yyyy')}`
}

export function bookingOccursOnDate(booking, date) {
  return date >= getBookingStartDate(booking) && date <= getBookingEndDate(booking)
}

export function isMultiDayBooking(booking) {
  return getBookingStartDate(booking) !== getBookingEndDate(booking)
}

export function isRemoteBooking(booking) {
  return booking.accessMode === 'remote' || isMultiDayBooking(booking)
}

export function formatBookingTime(booking) {
  return isRemoteBooking(booking) ? '24-hour remote access' : `${booking.startTime}–${booking.endTime}`
}

export function getBookingTimeBounds(booking) {
  return isRemoteBooking(booking)
    ? { startTime: '00:00', endTime: '24:00' }
    : { startTime: booking.startTime, endTime: booking.endTime }
}

export function formatShortDate(date) {
  return format(parseISO(date), 'd MMM')
}

export function formatRequestDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date))
}

export function getBangkokDateKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value))
  const part = (type) => parts.find((item) => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function isBookingConflict(bookings, { pcId, date, startDate, endDate, startTime, endTime }) {
  const requestedStartDate = startDate || date
  const requestedEndDate = endDate || startDate || date
  const requestedTime = requestedStartDate !== requestedEndDate
    ? { startTime: '00:00', endTime: '24:00' }
    : { startTime, endTime }
  return bookings.some((booking) => {
    const existingTime = getBookingTimeBounds(booking)
    return (
      booking.pcId === pcId &&
      BLOCKING_BOOKING_STATUSES.includes(booking.status) &&
      requestedStartDate <= getBookingEndDate(booking) &&
      requestedEndDate >= getBookingStartDate(booking) &&
      requestedTime.startTime < existingTime.endTime &&
      requestedTime.endTime > existingTime.startTime
    )
  })
}

export function isOwnBooking(booking, user) {
  return booking.requesterId === user?.id
}
