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

export async function getCurrentProfile(userId) {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('id, email, display_name, university_id, role, advisor_id, advisor:profiles!profiles_advisor_fk(display_name)')
    .eq('id', userId)
    .single()

  if (error) throw error

  return {
    id: data.id,
    email: data.email,
    name: data.display_name,
    studentId: data.university_id,
    role: data.role,
    advisorId: data.advisor_id,
    advisor: data.advisor?.display_name || null,
    department: 'School of Applied Digital Technology',
  }
}
