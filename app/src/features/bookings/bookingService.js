import { mockBookings } from '../../data/mockBookings.js'
import { isBookingConflict } from '../../utils/booking.js'

const STORAGE_KEY = 'se-lab-demo-bookings-v1'

function persist(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
  return bookings
}

export function getBookings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // Invalid local demo data is safely replaced by the seed set.
  }
  return persist(mockBookings)
}

export function createBooking(input, student, pc) {
  const bookings = getBookings()
  const startDate = input.startDate || input.date
  const endDate = input.endDate || input.startDate || input.date
  const isMultiDay = startDate && endDate && startDate !== endDate
  const startTime = isMultiDay ? '00:00' : input.startTime
  const endTime = isMultiDay ? '24:00' : input.endTime
  if (!pc) throw new Error('The selected PC could not be found.')
  if (pc.status === 'Maintenance' || pc.status === 'Inactive') {
    throw new Error('The selected PC is not available for booking.')
  }
  if (!startDate || !endDate || startDate > endDate) {
    throw new Error('The booking end date must be on or after the start date.')
  }
  if (!isMultiDay && (!startTime || !endTime || startTime >= endTime)) {
    throw new Error('The booking start time must be before the end time.')
  }
  if (!isMultiDay && (startTime < '08:00' || endTime > '18:00')) {
    throw new Error('One-day bookings must be within lab hours, 08:00–18:00.')
  }
  if (isBookingConflict(bookings, { ...input, startDate, endDate, startTime, endTime })) {
    throw new Error(isMultiDay ? 'This PC is unavailable for part of the selected date range.' : 'This PC is unavailable during the selected time.')
  }
  const booking = {
    id: `REQ-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    studentId: student.id,
    studentName: student.name,
    studentNumber: student.studentId,
    advisorName: student.advisor,
    pcId: pc.id,
    room: pc.room,
    startDate,
    endDate,
    accessMode: isMultiDay ? 'remote' : 'lab',
    startTime,
    endTime,
    purpose: input.purpose.trim(),
    course: input.course?.trim() || 'Not specified',
    requestedAt: new Date().toISOString(),
    status: 'pending_advisor',
    advisorDecision: 'pending',
    deanDecision: 'waiting',
  }
  persist([booking, ...bookings])
  return booking
}

function updateBooking(id, updater) {
  let updated
  const next = getBookings().map((booking) => {
    if (booking.id !== id) return booking
    updated = updater(booking)
    return updated
  })
  if (!updated) throw new Error(`Booking ${id} was not found.`)
  persist(next)
  return updated
}

export function approveAsAdvisor(id) {
  return updateBooking(id, (booking) => {
    if (booking.status !== 'pending_advisor') throw new Error('Only requests pending advisor review can be approved by an advisor.')
    return {
      ...booking,
      status: 'pending_dean',
      advisorDecision: 'approved',
      advisorDecisionAt: new Date().toISOString(),
      deanDecision: 'pending',
    }
  })
}

export function rejectAsAdvisor(id, reason) {
  if (!reason?.trim()) throw new Error('A rejection reason is required.')
  return updateBooking(id, (booking) => {
    if (booking.status !== 'pending_advisor') throw new Error('Only requests pending advisor review can be rejected by an advisor.')
    return {
      ...booking,
      status: 'rejected',
      advisorDecision: 'rejected',
      advisorDecisionAt: new Date().toISOString(),
      deanDecision: 'not_required',
      rejectionReason: reason.trim(),
      rejectedBy: 'advisor',
    }
  })
}

export function approveAsDean(id) {
  return updateBooking(id, (booking) => {
    if (booking.status !== 'pending_dean') throw new Error('Only requests pending dean review can receive final approval.')
    return {
      ...booking,
      status: 'approved',
      deanDecision: 'approved',
      deanDecisionAt: new Date().toISOString(),
    }
  })
}

export function rejectAsDean(id, reason) {
  if (!reason?.trim()) throw new Error('A rejection reason is required.')
  return updateBooking(id, (booking) => {
    if (booking.status !== 'pending_dean') throw new Error('Only requests pending dean review can be rejected by the dean.')
    return {
      ...booking,
      status: 'rejected',
      deanDecision: 'rejected',
      deanDecisionAt: new Date().toISOString(),
      rejectionReason: reason.trim(),
      rejectedBy: 'dean',
    }
  })
}

export function resetDemoBookings() {
  return persist(mockBookings)
}
