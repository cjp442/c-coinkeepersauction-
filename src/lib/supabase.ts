// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function setupRealTimeSubscription(table: string, onInsert: (payload: any) => void) {
  const subscription = supabase
    .channel(`realtime:${table}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, onInsert)
    .subscribe()
  return subscription
}

export async function handleTransaction(table: string, record: object) {
  const { data, error } = await supabase.from(table).upsert([record])
  if (error) { console.error('Transaction error:', error); return null }
  return data
}

export function handleError(error: any) {
  if (error) console.error('Supabase error:', error.message)
}
