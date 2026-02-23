import { createClient } from '@supabase/supabase-js'
import { HostRoom, MemberRoom, DecorItem, DecorPlacement } from '../types/game'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

export const gameService = {
  async getHostRooms(): Promise<HostRoom[]> {
    const { data, error } = await supabase.from('host_rooms').select('*').eq('is_active', true)
    if (error) throw error
    return data || []
  },
  async getMemberRooms(): Promise<MemberRoom[]> {
    const { data, error } = await supabase.from('member_rooms').select('*').eq('is_public', true)
    if (error) throw error
    return data || []
  },
  async getMemberRoom(userId: string): Promise<MemberRoom | null> {
    const { data, error } = await supabase.from('member_rooms').select('*').eq('owner_id', userId).single()
    if (error) return null
    return data
  },
  async upsertMemberRoom(room: Partial<MemberRoom>): Promise<void> {
    const { error } = await supabase.from('member_rooms').upsert(room)
    if (error) throw error
  },
  async getDecorItems(): Promise<DecorItem[]> {
    const { data, error } = await supabase.from('room_decor').select('*')
    if (error) throw error
    return data || []
  },
  async getPurchasedDecor(userId: string): Promise<string[]> {
    const { data, error } = await supabase.from('member_decor').select('decor_id').eq('user_id', userId)
    if (error) throw error
    return (data || []).map((d: { decor_id: string }) => d.decor_id)
  },
  async purchaseDecor(userId: string, decorId: string): Promise<void> {
    const { error } = await supabase.from('member_decor').insert({ user_id: userId, decor_id: decorId })
    if (error) throw error
  },
  async updateRoomDecor(roomId: string, placements: DecorPlacement[]): Promise<void> {
    const { error } = await supabase.from('member_rooms').update({ decor: placements }).eq('id', roomId)
    if (error) throw error
  },
  async logPlayerPosition(_userId: string, _scene: string, _position: { x: number; y: number; z: number }): Promise<void> {
    // Placeholder for realtime position sync
  }
}
