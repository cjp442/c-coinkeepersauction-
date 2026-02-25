// src/services/adminService.ts
import { AdminUser, AdminStats, AdminLog } from '../types/admin'

async function getUsers(): Promise<AdminUser[]> {
  // Replace with: const { data } = await supabase.from('profiles').select('*')
  const stored = localStorage.getItem('admin_users')
  return stored ? JSON.parse(stored) : []
}

async function banUser(userId: string, reason: string, adminId: string): Promise<void> {
  // Replace with: await supabase.from('bans').insert({ user_id: userId, reason, banned_by: adminId })
  console.info(`[AdminService] banUser ${userId} by ${adminId}: ${reason}`)
}

async function unbanUser(userId: string, adminId: string): Promise<void> {
  // Replace with: await supabase.from('bans').update({ is_active: false }).eq('user_id', userId)
  console.info(`[AdminService] unbanUser ${userId} by ${adminId}`)
}

async function setUserRole(userId: string, role: string, adminId: string): Promise<void> {
  // Replace with: await supabase.from('profiles').update({ role }).eq('id', userId)
  console.info(`[AdminService] setUserRole ${userId} -> ${role} by ${adminId}`)
}

async function getStats(): Promise<AdminStats> {
  // Replace with real Supabase aggregations
  return {
    totalUsers: 0,
    activeUsers: 0,
    totalHosts: 0,
    totalRevenue: 0,
    totalTokensInCirculation: 0,
    activeAuctions: 0,
    activeStreams: 0,
  }
}

async function getLogs(): Promise<AdminLog[]> {
  // Replace with: const { data } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false })
  return []
}

export const adminService = { getUsers, banUser, unbanUser, setUserRole, getStats, getLogs }

