import { useState } from 'react'
import { Shield, X, Users, DollarSign, Activity, ExternalLink } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminToolbar() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user || user.role !== 'admin') return null

  const stats = {
    activePlayers: 42,
    totalRevenue: 18450,
    activeSessions: 17,
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 w-64 text-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-amber-500 font-semibold flex items-center gap-1">
              <Shield size={14} /> Admin Quick Stats
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
              aria-label="Close admin toolbar"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2">
              <span className="flex items-center gap-2 text-slate-300">
                <Users size={13} className="text-amber-500" /> Active Players
              </span>
              <span className="font-bold text-white">{stats.activePlayers}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2">
              <span className="flex items-center gap-2 text-slate-300">
                <DollarSign size={13} className="text-amber-500" /> Total Revenue
              </span>
              <span className="font-bold text-white">${stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2">
              <span className="flex items-center gap-2 text-slate-300">
                <Activity size={13} className="text-amber-500" /> Active Sessions
              </span>
              <span className="font-bold text-white">{stats.activeSessions}</span>
            </div>
          </div>

          <a
            href="/admin"
            className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded px-3 py-2 transition-colors"
          >
            <ExternalLink size={13} /> Open Admin Panel
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-slate-800 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-500 rounded-full p-2.5 shadow-lg transition-colors"
        aria-label="Toggle admin toolbar"
      >
        <Shield size={16} />
      </button>
    </div>
  )
}
