import { requireSupabase } from '../../lib/supabase.js'

function titleCaseStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export async function getPcs() {
  const { data, error } = await requireSupabase()
    .from('pcs')
    .select('id, code, room, status, specification, notes')
    .order('code')

  if (error) throw error

  return data.map((pc) => ({
    id: pc.code,
    databaseId: pc.id,
    number: pc.code,
    room: pc.room,
    status: titleCaseStatus(pc.status),
    specification: pc.specification,
    notes: pc.notes,
  }))
}
