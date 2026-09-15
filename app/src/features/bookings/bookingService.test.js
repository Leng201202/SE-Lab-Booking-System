import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { demoUsers } from '../../data/mockUsers.js'
import { mockPcs } from '../../data/mockPcs.js'
import { bookingOccursOnDate, formatBookingDateRange, formatBookingTime, isBookingConflict } from '../../utils/booking.js'

const memory = new Map()
globalThis.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value),
  removeItem: (key) => memory.delete(key),
}

const service = await import('./bookingService.js')

beforeEach(() => {
  memory.clear()
  service.resetDemoBookings()
})

test('rejects an overlapping active booking interval', () => {
  assert.equal(
    isBookingConflict(service.getBookings(), {
      pcId: 'PC-03',
      date: '2026-09-20',
      startTime: '10:30',
      endTime: '11:30',
    }),
    true,
  )
  assert.equal(
    isBookingConflict(service.getBookings(), {
      pcId: 'PC-03',
      date: '2026-09-20',
      startTime: '12:00',
      endTime: '13:00',
    }),
    false,
  )
  assert.equal(
    isBookingConflict(service.getBookings(), {
      pcId: 'PC-03',
      startDate: '2026-09-15',
      endDate: '2026-10-02',
      startTime: '11:00',
      endTime: '11:30',
    }),
    true,
  )
})

test('service blocks conflicts, invalid times, and maintenance PCs', () => {
  const common = {
    pcId: 'PC-03',
    date: '2026-09-20',
    startTime: '10:30',
    endTime: '11:30',
    purpose: 'Service validation test',
    course: 'SE Demo',
  }
  assert.throws(
    () => service.createBooking(common, demoUsers.student, mockPcs.find((pc) => pc.id === 'PC-03')),
    /unavailable/,
  )
  assert.throws(
    () => service.createBooking({ ...common, pcId: 'PC-06', startTime: '12:00', endTime: '11:00' }, demoUsers.student, mockPcs.find((pc) => pc.id === 'PC-06')),
    /start time/,
  )
  assert.throws(
    () => service.createBooking({ ...common, pcId: 'PC-06', date: '2026-09-25', startTime: '07:00', endTime: '09:00' }, demoUsers.student, mockPcs.find((pc) => pc.id === 'PC-06')),
    /lab hours/,
  )
  assert.throws(
    () => service.createBooking({ ...common, pcId: 'PC-06', date: '2026-09-25', startTime: '17:00', endTime: '19:00' }, demoUsers.student, mockPcs.find((pc) => pc.id === 'PC-06')),
    /lab hours/,
  )
  assert.throws(
    () => service.createBooking({ ...common, pcId: 'PC-04', date: '2026-09-25' }, demoUsers.student, mockPcs.find((pc) => pc.id === 'PC-04')),
    /not available/,
  )
})

test('moves a new request through advisor and dean approval', () => {
  const booking = service.createBooking(
    {
      pcId: 'PC-06',
      startDate: '2026-09-24',
      endDate: '2026-10-02',
      startTime: '09:00',
      endTime: '11:00',
      purpose: 'Automated workflow test',
      course: 'SE Demo',
    },
    demoUsers.student,
    mockPcs.find((pc) => pc.id === 'PC-06'),
  )

  assert.equal(booking.status, 'pending_advisor')
  assert.equal(booking.accessMode, 'remote')
  assert.equal(booking.startTime, '00:00')
  assert.equal(booking.endTime, '24:00')
  assert.equal(formatBookingTime(booking), '24-hour remote access')
  assert.equal(formatBookingDateRange(booking), '24 Sep–2 Oct 2026')
  assert.equal(bookingOccursOnDate(booking, '2026-09-30'), true)
  assert.equal(bookingOccursOnDate(booking, '2026-10-03'), false)
  service.approveAsAdvisor(booking.id)
  assert.equal(service.getBookings().find((item) => item.id === booking.id).status, 'pending_dean')
  service.approveAsDean(booking.id)
  assert.equal(service.getBookings().find((item) => item.id === booking.id).status, 'approved')
})

test('advisor rejection records a required reason', () => {
  service.rejectAsAdvisor('REQ-2026-001', 'Course information needs correction.')
  const booking = service.getBookings().find((item) => item.id === 'REQ-2026-001')
  assert.equal(booking.status, 'rejected')
  assert.equal(booking.rejectedBy, 'advisor')
  assert.equal(booking.rejectionReason, 'Course information needs correction.')
})

test('dean rejection records the final reviewer and reason', () => {
  service.rejectAsDean('REQ-2026-002', 'The lab is reserved for an examination.')
  const booking = service.getBookings().find((item) => item.id === 'REQ-2026-002')
  assert.equal(booking.status, 'rejected')
  assert.equal(booking.rejectedBy, 'dean')
  assert.equal(booking.rejectionReason, 'The lab is reserved for an examination.')
})

test('service refuses invalid approval transitions and blank rejection reasons', () => {
  assert.throws(() => service.approveAsDean('REQ-2026-001'), /pending dean review/)
  assert.throws(() => service.approveAsAdvisor('REQ-2026-002'), /pending advisor review/)
  assert.throws(() => service.rejectAsAdvisor('REQ-2026-001', '  '), /reason is required/)
})
