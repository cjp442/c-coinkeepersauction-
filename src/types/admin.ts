export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalHosts: number
  totalRevenue: number
  totalTokensInCirculation: number
  activeAuctions: number
  activeStreams: number
}

export interface AdminUser {
  id: string
  email: string
  username: string
  role: string
  createdAt: string
  lastActive?: string
  tokenBalance: number
  isBanned: boolean
}

export interface AdminTransaction {
  id: string
  userId: string
  username: string
  type: string
  amount: number
  taxAmount: number
  description: string
  createdAt: string
}

export interface BanRecord {
  id: string
  userId: string
  reason: string
  bannedBy: string
  bannedAt: string
  expiresAt?: string
  isActive: boolean
}

export interface AdminLog {
  id: string
  adminId: string
  adminUsername: string
  action: string
  targetId?: string
  targetType?: string
  details: string
  createdAt: string
}
