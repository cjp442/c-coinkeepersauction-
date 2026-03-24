import { AdminStats, AdminUser, AdminTransaction, AdminLog } from '../types/admin'

export const adminService = {
  async getStats(): Promise<AdminStats> {
    return {
      totalUsers: 0, activeUsers: 0, totalHosts: 0,
      totalRevenue: 0, totalTokensInCirculation: 0,
      activeAuctions: 0, activeStreams: 0,
    }
  },
  async getUsers(_page = 0, _limit = 50): Promise<AdminUser[]> {
    return []
  },
  async banUser(_userId: string, _reason: string, _adminId: string): Promise<void> {},
  async unbanUser(_userId: string, _adminId: string): Promise<void> {},
  async deleteUser(_userId: string, _adminId: string): Promise<void> {},
  async getTransactions(_page = 0, _limit = 100): Promise<AdminTransaction[]> {
    return []
  },
  async getAdminLogs(_limit = 100): Promise<AdminLog[]> {
    return []
  },
  async setUserRole(_userId: string, _role: string, _adminId: string): Promise<void> {},
  async broadcastMessage(_message: string, _adminId: string): Promise<void> {},
}
