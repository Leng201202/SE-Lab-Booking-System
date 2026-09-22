import { createClient } from '@supabase/supabase-js'

const environment = import.meta.env || {}
const supabaseUrl = environment.VITE_SUPABASE_URL
const supabasePublishableKey = environment.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Copy app/.env.example to app/.env.local and add your project values.')
  }
  return supabase
}
