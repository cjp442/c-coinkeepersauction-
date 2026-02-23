// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function setupRealTimeSubscription(table: string, onInsert: (payload: unknown) => void) {
  const channel = supabase
    .channel(`realtime:${table}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, onInsert)
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export async function handleTransaction<T>(
  fn: () => Promise<{ data: T | null; error: unknown }>,
): Promise<T> {
  const { data, error } = await fn()
  if (error) {
    handleError(error)
    throw error
  }
  return data as T
}

export function handleError(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    console.error('Supabase error:', (error as { message: string }).message)
  } else {
    console.error('Unknown error:', error)
  }
}
