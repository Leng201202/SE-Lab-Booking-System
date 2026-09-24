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

export async function updateMyUniversityId(userId, universityId) {
  const { error } = await requireSupabase()
    .from('profiles')
    .update({ university_id: universityId })
    .eq('id', userId)
  if (error) throw new Error(error.message)
}

export async function getCurrentProfile(userId) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, university_id, role, advisor_id')
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
  }
}
