import { requireSupabase } from '../../lib/supabase.js'

function titleCaseStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function mapPc(pc) {
  return {
    id: pc.code,
    databaseId: pc.id,
    number: pc.code,
    room: pc.room,
    status: titleCaseStatus(pc.status),
    statusValue: pc.status,
    specification: pc.specification,
    notes: pc.notes,
  }
}

export async function getPcs() {
  const { data, error } = await requireSupabase()
    .from('pcs')
    .select('id, code, room, status, specification, notes')
    .order('code')

  if (error) throw error

  return data.map(mapPc)
}

export async function createPc(input) {
  const { data, error } = await requireSupabase().rpc('create_pc', {
    p_code: input.code,
    p_room: input.room,
    p_specification: input.specification,
    p_status: input.status,
    p_notes: input.notes || null,
  })
  if (error) throw new Error(error.message)
  return mapPc(data)
}

export async function updatePc(id, input) {
  const { data, error } = await requireSupabase().rpc('update_pc', {
    p_pc_id: id,
    p_code: input.code,
    p_room: input.room,
    p_specification: input.specification,
    p_status: input.status,
    p_notes: input.notes || null,
  })
  if (error) throw new Error(error.message)
  return mapPc(data)
}
