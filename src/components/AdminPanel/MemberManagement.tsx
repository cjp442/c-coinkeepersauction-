import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { AdminUser } from '../../types/admin'
import { useAuth } from '../../contexts/AuthContext'
import { Ban, UserCheck, Shield } from 'lucide-react'

export default function MemberManagement() {
  const { user } = useAuth()
  const [members, setMembers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadMembers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getUsers()
      setMembers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMembers() }, [])

  const handleBan = async (memberId: string) => {
    const reason = prompt('Enter ban reason:')
    if (!reason || !user) return
    await adminService.banUser(memberId, reason, user.id)
    loadMembers()
  }

  const handleUnban = async (memberId: string) => {
    if (!user) return
    await adminService.unbanUser(memberId, user.id)
    loadMembers()
  }

  const handleSetRole = async (memberId: string) => {
    const role = prompt('Enter new role (user/vip/host/admin):')
    if (!role || !user) return
    await adminService.setUserRole(memberId, role, user.id)
    loadMembers()
  }

  const filtered = members.filter(m =>
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-amber-400">Member Management</h2>
      <input
        type="text"
        placeholder="Search members..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-4 bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
      />
      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="bg-slate-800 h-16 rounded" />))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3 pr-4">Username</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Tokens</th>
                <th className="pb-3 pr-4">Joined</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => (
                <tr key={member.id} className="border-b border-slate-800 hover:bg-slate-800">
                  <td className="py-3 pr-4 font-medium">{member.username}</td>
                  <td className="py-3 pr-4 text-slate-400">{member.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      member.role === 'admin' ? 'bg-red-900 text-red-300' :
                      member.role === 'host' ? 'bg-purple-900 text-purple-300' :
                      member.role === 'vip' ? 'bg-amber-900 text-amber-300' :
                      member.isBanned ? 'bg-gray-800 text-gray-500' :
                      'bg-slate-700 text-slate-300'
                    }`}>{member.role}</span>
                  </td>
                  <td className="py-3 pr-4 text-amber-400">{member.tokenBalance}</td>
                  <td className="py-3 pr-4 text-slate-400">{new Date(member.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {member.isBanned ? (
                        <button onClick={() => handleUnban(member.id)} className="text-green-400 hover:text-green-300" title="Unban"><UserCheck size={16} /></button>
                      ) : (
                        <button onClick={() => handleBan(member.id)} className="text-red-400 hover:text-red-300" title="Ban"><Ban size={16} /></button>
                      )}
                      <button onClick={() => handleSetRole(member.id)} className="text-blue-400 hover:text-blue-300" title="Set Role"><Shield size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-slate-500 py-8">No members found</p>}
        </div>
      )}
    </div>
  )
}
