import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mapBookingRow, mapCalendarRow } from './bookingService.js'
import {
  bookingOccursOnDate,
  formatBookingDateRange,
  formatBookingTime,
  getBangkokDateKey,
  getEarliestBookableTime,
  isBookingConflict,
  isBookingCancellable,
} from '../../utils/booking.js'

test('detects overlap only for active booking statuses', () => {
  const bookings = [
    { pcId: 'PC-03', startDate: '2026-09-20', endDate: '2026-09-20', startTime: '10:00', endTime: '12:00', status: 'approved' },
    { pcId: 'PC-03', startDate: '2026-09-21', endDate: '2026-09-21', startTime: '10:00', endTime: '12:00', status: 'rejected' },
  ]
  assert.equal(
    isBookingConflict(bookings, {
      pcId: 'PC-03',
      date: '2026-09-20',
      startTime: '10:30',
      endTime: '11:30',
    }),
    true,
  )
  assert.equal(
    isBookingConflict(bookings, {
      pcId: 'PC-03',
      date: '2026-09-21',
      startTime: '10:30',
      endTime: '11:30',
    }),
    false,
  )
})

test('maps a database booking to the existing page contract', () => {
  const booking = mapBookingRow({
    id: '8bce9953-74ac-4e60-878c-f6f7e489f380',
    request_number: 'REQ-2026-000001',
    requester_id: 'student-uuid',
    requester_role: 'student',
    advisor_id: 'advisor-uuid',
    pc_id: 'pc-uuid',
    start_date: '2026-09-24',
    end_date: '2026-10-02',
    start_time: '00:00:00',
    end_time: '24:00:00',
    access_mode: 'remote',
    purpose: 'Automated workflow test',
    course: 'SE Demo',
    created_at: '2026-09-22T01:00:00Z',
    status: 'pending_advisor',
    advisor_decision: 'pending',
    dean_decision: 'waiting',
    cancellation_reason: null,
    cancelled_at: null,
    cancelled_by: null,
    requester: { display_name: 'Student One', university_id: '65315000' },
    advisor: { display_name: 'Advisor One' },
    pc: { code: 'PC-06', room: 'SE Lab B · 402' },
  })

  assert.equal(booking.requestNumber, 'REQ-2026-000001')
  assert.equal(booking.status, 'pending_advisor')
  assert.equal(booking.requesterRole, 'student')
  assert.equal(booking.accessMode, 'remote')
  assert.equal(booking.startTime, '00:00')
  assert.equal(booking.endTime, '24:00')
  assert.equal(formatBookingTime(booking), '24-hour remote access')
  assert.equal(formatBookingDateRange(booking), '24 Sep–2 Oct 2026')
  assert.equal(bookingOccursOnDate(booking, '2026-09-30'), true)
  assert.equal(bookingOccursOnDate(booking, '2026-10-03'), false)
  assert.equal(booking.cancellationReason, null)
})

test('maps sanitized calendar rows without private requester data', () => {
  const booking = mapCalendarRow({
    id: 'booking-uuid',
    request_number: 'REQ-2026-000002',
    pc_id: 'pc-uuid',
    pc_code: 'PC-02',
    start_date: '2026-09-28',
    end_date: '2026-09-28',
    start_time: '09:15:00',
    end_time: '10:30:00',
    access_mode: 'lab',
    status: 'approved',
    is_own: false,
    can_view_details: false,
  })

  assert.equal(booking.pcId, 'PC-02')
  assert.equal(booking.startTime, '09:15')
  assert.equal(booking.canViewDetails, false)
  assert.equal('requesterName' in booking, false)
})

test('uses the Bangkok calendar date at UTC day boundaries', () => {
  assert.equal(getBangkokDateKey('2026-09-21T18:30:00.000Z'), '2026-09-22')
})

test('rounds today forward to the next Bangkok booking slot', () => {
  assert.equal(getEarliestBookableTime('2026-09-23', '2026-09-23T03:07:30.000Z'), '10:15')
  assert.equal(getEarliestBookableTime('2026-09-23', '2026-09-23T03:15:00.000Z'), '10:30')
})

test('does not offer past dates or a day with no remaining slot', () => {
  assert.equal(getEarliestBookableTime('2026-09-22', '2026-09-23T03:00:00.000Z'), null)
  assert.equal(getEarliestBookableTime('2026-09-24', '2026-09-23T03:00:00.000Z'), '08:00')
  assert.equal(getEarliestBookableTime('2026-09-23', '2026-09-23T10:45:01.000Z'), null)
})

test('allows every role to cancel only their own active future booking', () => {
  const booking = {
    requesterId: 'requester-1',
    status: 'pending_dean',
    startDate: '2026-09-24',
    endDate: '2026-09-24',
    startTime: '10:00',
    endTime: '11:00',
    accessMode: 'lab',
  }

  assert.equal(isBookingCancellable(booking, { id: 'requester-1', role: 'student' }, '2026-09-24T02:00:00.000Z'), true)
  assert.equal(isBookingCancellable(booking, { id: 'someone-else', role: 'advisor' }, '2026-09-24T02:00:00.000Z'), false)
  assert.equal(isBookingCancellable(booking, { id: 'requester-1', role: 'dean' }, '2026-09-24T02:00:00.000Z'), true)
})

test('does not allow cancellation after the booking starts or after it closes', () => {
  const booking = {
    requesterId: 'requester-1',
    status: 'approved',
    startDate: '2026-09-24',
    endDate: '2026-09-24',
    startTime: '10:00',
    endTime: '11:00',
    accessMode: 'lab',
  }

  assert.equal(isBookingCancellable(booking, { id: 'requester-1', role: 'advisor' }, '2026-09-24T03:00:00.000Z'), false)
  assert.equal(isBookingCancellable({ ...booking, status: 'cancelled' }, { id: 'requester-1', role: 'advisor' }, '2026-09-24T02:00:00.000Z'), false)
})
