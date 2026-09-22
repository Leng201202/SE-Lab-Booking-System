import { requireSupabase } from '../../lib/supabase.js'

function shortTime(value, fallback = '') {
  return value ? String(value).slice(0, 5) : fallback
}

export function mapBookingRow(row) {
  return {
    id: row.id,
    requestNumber: row.request_number,
    requesterId: row.requester_id,
    requesterRole: row.requester_role,
    requesterName: row.requester?.display_name || 'Unknown requester',
    requesterNumber: row.requester?.university_id || 'Not provided',
    advisorId: row.advisor_id,
    advisorName: row.advisor?.display_name || 'Not required',
    pcDatabaseId: row.pc_id,
    pcId: row.pc?.code || row.pc_code,
    room: row.pc?.room || '',
    startDate: row.start_date,
    endDate: row.end_date,
    accessMode: row.access_mode,
    startTime: shortTime(row.start_time, '00:00'),
    endTime: row.access_mode === 'remote' ? '24:00' : shortTime(row.end_time, '24:00'),
    purpose: row.purpose,
    course: row.course,
    requestedAt: row.created_at,
    status: row.status,
    advisorDecision: row.advisor_decision,
    advisorDecisionAt: row.advisor_decision_at,
    deanDecision: row.dean_decision,
    deanDecisionAt: row.dean_decision_at,
    rejectionReason: row.rejection_reason,
    rejectedBy: row.rejected_by,
  }
}

export function mapCalendarRow(row) {
  return {
    id: row.id,
    requestNumber: row.request_number,
    pcDatabaseId: row.pc_id,
    pcId: row.pc_code,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: shortTime(row.start_time, '00:00'),
    endTime: row.access_mode === 'remote' ? '24:00' : shortTime(row.end_time, '24:00'),
    accessMode: row.access_mode,
    status: row.status,
    isOwn: row.is_own,
    canViewDetails: row.can_view_details,
  }
}

const bookingSelect = `
  id,
  request_number,
  requester_id,
  requester_role,
  advisor_id,
  pc_id,
  start_date,
  end_date,
  start_time,
  end_time,
  access_mode,
  purpose,
  course,
  created_at,
  status,
  advisor_decision,
  advisor_decision_at,
  dean_decision,
  dean_decision_at,
  rejection_reason,
  rejected_by,
  requester:profiles!requester_id(display_name, university_id),
  advisor:profiles!advisor_id(display_name),
  pc:pcs!pc_id(code, room)
`

export async function getBookings() {
  const { data, error } = await requireSupabase()
    .from('bookings')
    .select(bookingSelect)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(mapBookingRow)
}

export async function getCalendarBookings(startDate, endDate) {
  const { data, error } = await requireSupabase().rpc('get_booking_calendar', {
    p_from: startDate,
    p_to: endDate,
  })

  if (error) throw error
  return data.map(mapCalendarRow)
}

export async function createBooking(input, pc) {
  if (!pc?.databaseId) throw new Error('The selected PC could not be found.')

  const { data, error } = await requireSupabase().rpc('create_booking', {
    p_pc_id: pc.databaseId,
    p_start_date: input.startDate,
    p_end_date: input.endDate,
    p_start_time: input.startTime || null,
    p_end_time: input.endTime || null,
    p_purpose: input.purpose,
    p_course: input.course || null,
  })

  if (error) throw new Error(error.message)
  return data
}

export async function approveBooking(id) {
  const { data, error } = await requireSupabase().rpc('approve_booking', { p_booking_id: id })
  if (error) throw new Error(error.message)
  return data
}

export async function rejectBooking(id, reason) {
  const { data, error } = await requireSupabase().rpc('reject_booking', {
    p_booking_id: id,
    p_reason: reason,
  })
  if (error) throw new Error(error.message)
  return data
}
