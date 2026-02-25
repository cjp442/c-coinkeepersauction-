import { supabase } from '../lib/supabase'
import { AdminUser, AdminStats } from '../types/admin'

export const adminService = {
  async getUsers(): Promise<AdminUser[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, username, role, created_at')
    if (error) throw error

    const { data: bans } = await supabase
      .from('bans')
      .select('user_id, is_active')
      .eq('is_active', true)

    const bannedIds = new Set((bans || []).map((b: any) => b.user_id))

    return (users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      role: u.role,
      createdAt: u.created_at,
      tokenBalance: 0,
      isBanned: bannedIds.has(u.id),
    }))
  },

  async banUser(userId: string, reason: string, adminId: string): Promise<void> {
    const { error } = await supabase.from('bans').insert({
      user_id: userId,
      reason,
      banned_by: adminId,
      is_active: true,
    })
    if (error) throw error
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: 'ban_user',
      target_id: userId,
      target_type: 'user',
      details: reason,
    })
  },

  async unbanUser(userId: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('bans')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)
    if (error) throw error
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: 'unban_user',
      target_id: userId,
      target_type: 'user',
      details: 'User unbanned',
    })
  },

  async setUserRole(userId: string, role: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
    if (error) throw error
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action: 'set_role',
      target_id: userId,
      target_type: 'user',
      details: `Role set to ${role}`,
    })
  },

  async getStats(): Promise<AdminStats> {
    const [{ count: totalUsers }, { count: activeAuctions }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('auctions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    ])
    return {
      totalUsers: totalUsers || 0,
      activeUsers: 0,
      totalHosts: 0,
      totalRevenue: 0,
      totalTokensInCirculation: 0,
      activeAuctions: activeAuctions || 0,
      activeStreams: 0,
    }
  },

  async getSiteSettings(): Promise<Record<string, string>> {
    const { data, error } = await supabase.from('site_settings').select('key, value')
    if (error) throw error
    return Object.fromEntries((data || []).map((r: any) => [r.key, r.value]))
  },

  async updateSiteSettings(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
    if (error) throw error
  },
}
