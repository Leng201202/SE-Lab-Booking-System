import { requireSupabase } from '../../lib/supabase.js'

function mapUsers(rows) {
  const names = new Map(rows.map((row) => [row.id, row.display_name]))
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.display_name,
    universityId: row.university_id,
    role: row.role,
    advisorId: row.advisor_id,
    advisorName: row.advisor_id ? names.get(row.advisor_id) || 'Assigned advisor' : null,
  }))
}

export async function getManageableUsers() {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('id, email, display_name, university_id, role, advisor_id')
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

export async function assignStudentAdvisor(studentId, advisorId) {
  const { data, error } = await requireSupabase().rpc('assign_student_advisor', {
    p_student_id: studentId,
    p_advisor_id: advisorId || null,
  })
  if (error) throw new Error(error.message)
  return data
}
