import { requireSupabase } from '../../lib/supabase.js'

export async function getSession() {
  const { data, error } = await requireSupabase().auth.getSession()
  if (error) throw error
  return data.session
}

export function onAuthStateChange(callback) {
  const { data } = requireSupabase().auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

export async function signInWithGoogle() {
  const { error } = await requireSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'openid email profile',
    },
  })
  if (error) throw error
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut()
  if (error) throw error
}

export async function updateMyUniversityId(universityId) {
  const { error } = await requireSupabase().rpc('update_my_student_id', {
    p_university_id: universityId,
  })
  if (error) throw new Error(error.message)
}

export async function requestAccountDeletion() {
  const { error } = await requireSupabase().rpc('request_account_deletion')
  if (error) throw new Error(error.message)
}

export async function reactivateMyAccount() {
  const { error } = await requireSupabase().rpc('reactivate_my_account')
  if (error) throw new Error(error.message)
}

export async function getCurrentProfile(userId) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, university_id, role, advisor_id, is_deactivated, deletion_requested_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    throw new Error('Your Google account is authenticated, but its application profile is missing. Deploy the latest Supabase migrations and sign in again.')
  }

  let advisorName = null
  if (data.advisor_id) {
    const { data: advisor, error: advisorError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', data.advisor_id)
      .maybeSingle()

    if (advisorError) throw advisorError
    advisorName = advisor?.display_name || null
  }

  return {
    id: data.id,
    email: data.email,
    name: data.display_name,
    studentId: data.university_id,
    role: data.role,
    advisorId: data.advisor_id,
    advisor: advisorName,
    department: 'School of Applied Digital Technology',
    isDeactivated: data.is_deactivated,
    deletionRequestedAt: data.deletion_requested_at,
  }
}
