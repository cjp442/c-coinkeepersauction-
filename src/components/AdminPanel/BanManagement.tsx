import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { AdminUser } from '../../types/admin'
import { useAuth } from '../../contexts/AuthContext'
import { UserCheck, RefreshCw } from 'lucide-react'

export default function BanManagement() {
  const { user } = useAuth()
  const [bannedUsers, setBannedUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const loadBannedUsers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getUsers()
      setBannedUsers(data.filter(u => u.isBanned))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBannedUsers() }, [])

  const handleUnban = async (userId: string) => {
    if (!user) return
    try {
      await adminService.unbanUser(userId, user.id)
      loadBannedUsers()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-amber-400">Ban Management</h2>
          {!loading && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-900 text-red-300">
              {bannedUsers.length} banned
            </span>
          )}
        </div>
        <button
          onClick={loadBannedUsers}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-sm text-slate-300 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="bg-slate-800 h-14 rounded" />))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3 pr-4">Username</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Account Created</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bannedUsers.map(member => (
                <tr key={member.id} className="border-b border-slate-800 hover:bg-slate-800">
                  <td className="py-3 pr-4 font-medium text-slate-300">{member.username}</td>
                  <td className="py-3 pr-4 text-slate-400">{member.email}</td>
                  <td className="py-3 pr-4 text-slate-400">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleUnban(member.id)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-green-900 hover:bg-green-800 text-green-300 rounded text-xs font-medium transition-colors"
                      title="Unban user"
                    >
                      <UserCheck size={13} />
                      Unban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bannedUsers.length === 0 && <p className="text-center text-slate-500 py-8">No banned users</p>}
        </div>
      )}
    </div>
  )
}
