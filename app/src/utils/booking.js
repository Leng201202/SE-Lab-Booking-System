import { format, parseISO } from 'date-fns'

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
  return format(new Date(date), 'd MMM yyyy, HH:mm')
}

export function isBookingConflict(bookings, { pcId, date, startDate, endDate, startTime, endTime }) {
  const blockingStatuses = ['pending_advisor', 'pending_dean', 'approved']
  const requestedStartDate = startDate || date
  const requestedEndDate = endDate || startDate || date
  const requestedTime = requestedStartDate !== requestedEndDate
    ? { startTime: '00:00', endTime: '24:00' }
    : { startTime, endTime }
  return bookings.some((booking) => {
    const existingTime = getBookingTimeBounds(booking)
    return (
      booking.pcId === pcId &&
      blockingStatuses.includes(booking.status) &&
      requestedStartDate <= getBookingEndDate(booking) &&
      requestedEndDate >= getBookingStartDate(booking) &&
      requestedTime.startTime < existingTime.endTime &&
      requestedTime.endTime > existingTime.startTime
    )
  })
}

export function isStudentBooking(booking, user) {
  return booking.studentId === user?.id
}
