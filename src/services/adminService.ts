import { createClient } from '@supabase/supabase-js'
import { AdminStats, AdminUser, AdminTransaction, AdminLog } from '../types/admin'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const [usersRes, transRes, streamsRes, auctionsRes] = await Promise.all([
      supabase.from('profiles').select('id, role', { count: 'exact' }),
      supabase.from('coin_transactions').select('amount, type'),
      supabase.from('live_streams').select('id').eq('is_live', true),
      supabase.from('auctions').select('id').eq('status', 'active'),
    ])
    const users = usersRes.data || []
    const transactions = transRes.data || []
    const totalRevenue = transactions.filter((t: { type: string; amount: number }) => t.type === 'purchase').reduce((sum: number, t: { amount: number }) => sum + (t.amount || 0), 0)
    const totalTokens = transactions.reduce((sum: number, t: { type: string; amount: number }) => {
      if (t.type === 'purchase') return sum + t.amount
      if (t.type === 'spend') return sum - t.amount
      return sum
    }, 0)
    return {
      totalUsers: usersRes.count || 0,
      activeUsers: users.filter((u: { role: string }) => u.role !== 'banned').length,
      totalHosts: users.filter((u: { role: string }) => u.role === 'host').length,
      totalRevenue,
      totalTokensInCirculation: Math.max(0, totalTokens),
      activeAuctions: (auctionsRes.data || []).length,
      activeStreams: (streamsRes.data || []).length,
    }
  },
  async getUsers(page = 0, limit = 50): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, username, role, created_at, keepers_coins (balance)')
      .range(page * limit, (page + 1) * limit - 1)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map((u: { id: string; email: string; username: string; role: string; created_at: string; keepers_coins?: { balance: number }[] }) => ({
      id: u.id, email: u.email, username: u.username, role: u.role, createdAt: u.created_at,
      tokenBalance: u.keepers_coins?.[0]?.balance || 0, isBanned: u.role === 'banned',
    }))
  },
  async banUser(userId: string, reason: string, adminId: string): Promise<void> {
    await Promise.all([
      supabase.from('bans').insert({ user_id: userId, reason, banned_by: adminId, is_active: true }),
      supabase.from('profiles').update({ role: 'banned' }).eq('id', userId),
      supabase.from('admin_logs').insert({ admin_id: adminId, action: 'ban_user', target_id: userId, target_type: 'user', details: reason }),
    ])
  },
  async unbanUser(userId: string, adminId: string): Promise<void> {
    await Promise.all([
      supabase.from('bans').update({ is_active: false }).eq('user_id', userId),
      supabase.from('profiles').update({ role: 'user' }).eq('id', userId),
      supabase.from('admin_logs').insert({ admin_id: adminId, action: 'unban_user', target_id: userId, target_type: 'user', details: 'User unbanned' }),
    ])
  },
  async deleteUser(userId: string, adminId: string): Promise<void> {
    await supabase.from('admin_logs').insert({ admin_id: adminId, action: 'delete_user', target_id: userId, target_type: 'user', details: 'User account deleted' })
    await supabase.auth.admin.deleteUser(userId)
  },
  async getTransactions(page = 0, limit = 100): Promise<AdminTransaction[]> {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select('id, user_id, type, amount, tax_amount, description, created_at, profiles!user_id (username)')
      .range(page * limit, (page + 1) * limit - 1)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map((t: { id: string; user_id: string; type: string; amount: number; tax_amount: number; description: string; created_at: string; profiles?: { username: string }[] }) => ({
      id: t.id, userId: t.user_id, username: t.profiles?.[0]?.username || 'Unknown',
      type: t.type, amount: t.amount, taxAmount: t.tax_amount, description: t.description, createdAt: t.created_at,
    }))
  },
  async getAdminLogs(limit = 100): Promise<AdminLog[]> {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('id, admin_id, action, target_id, target_type, details, created_at, profiles!admin_id (username)')
      .limit(limit)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map((l: { id: string; admin_id: string; action: string; target_id?: string; target_type?: string; details: string; created_at: string; profiles?: { username: string }[] }) => ({
      id: l.id, adminId: l.admin_id, adminUsername: l.profiles?.[0]?.username || 'Unknown',
      action: l.action, targetId: l.target_id, targetType: l.target_type, details: l.details, createdAt: l.created_at,
    }))
  },
  async broadcastMessage(message: string, adminId: string): Promise<void> {
    const { error } = await supabase.from('admin_logs').insert({ admin_id: adminId, action: 'broadcast_message', details: message })
    if (error) throw error
  },
  async setUserRole(userId: string, role: string, adminId: string): Promise<void> {
    await supabase.from('profiles').update({ role }).eq('id', userId)
    await supabase.from('admin_logs').insert({ admin_id: adminId, action: 'set_role', target_id: userId, target_type: 'user', details: `Role set to: ${role}` })
  }
}
