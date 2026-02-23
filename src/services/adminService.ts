// src/services/adminService.ts
import { AdminUser } from '../types/admin'

class AdminService {
  async getUsers(): Promise<AdminUser[]> {
    // Stub: returns mock data until backend is wired up
    return []
  }

  async banUser(userId: string, reason: string, _adminId: string): Promise<void> {
    console.log(`Ban user ${userId}: ${reason}`)
  }

  async unbanUser(userId: string, _adminId: string): Promise<void> {
    console.log(`Unban user ${userId}`)
  }

  async setUserRole(userId: string, role: string, _adminId: string): Promise<void> {
    console.log(`Set role of ${userId} to ${role}`)
  }

  static getAllMembers() {
    return []
  }

  static getAllTransactions() {
    return []
  }

  static banUser(userId: string) {
    console.log(`Ban user ${userId}`)
  }

  static deleteUser(userId: string) {
    console.log(`Delete user ${userId}`)
  }

  static getAdminLogs() {
    return []
  }

  static updateSettings(_newSettings: object) {
    // no-op stub
  }

  static exportData() {
    return null
  }
}

export default AdminService
export const adminService = new AdminService()
