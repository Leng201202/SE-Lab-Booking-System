import { requireSupabase } from '../../lib/supabase.js'

function mapUsers(rows) {
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.display_name,
    universityId: row.university_id,
    role: row.role,
  }))
}

export async function getManageableUsers() {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('id, email, display_name, university_id, role')
    .eq('is_deactivated', false)
    .order('display_name')

  if (error) throw error
  return mapUsers(data)
}

export async function setUserRole(profileId, role) {
  const { data, error } = await requireSupabase().rpc('set_user_role', {
    p_profile_id: profileId,
    p_role: role,
  })
  if (error) throw new Error(error.message)
  return data
}
