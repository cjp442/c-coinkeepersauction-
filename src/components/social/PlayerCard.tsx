import { useState } from 'react'
import { UserCircle, Flag, UserPlus, X } from 'lucide-react'

type PlayerStatus = 'online' | 'offline' | 'vip'

const STATUS_CONFIG: Record<PlayerStatus, { label: string; dot: string; badge: string }> = {
  online: { label: 'Online', dot: 'bg-green-400', badge: 'bg-green-500/20 text-green-400 border-green-500/30' },
  offline: { label: 'Offline', dot: 'bg-slate-500', badge: 'bg-slate-700 text-slate-400 border-slate-600' },
  vip: { label: 'VIP', dot: 'bg-amber-400', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
}

interface Props {
  playerId: string
  playerName: string
  level?: number
  status?: PlayerStatus
  onReport?: () => void
}

// TODO: use playerId to fetch real player data from API
export default function PlayerCard({ playerId: _playerId, playerName, level = 1, status = 'online', onReport }: Props) {
  const [friendAdded, setFriendAdded] = useState(false)
  const [reportConfirm, setReportConfirm] = useState(false)
  const [reported, setReported] = useState(false)

  const cfg = STATUS_CONFIG[status]

  const handleAddFriend = () => {
    setFriendAdded(true)
  }

  const handleReportConfirm = () => {
    setReported(true)
    setReportConfirm(false)
    onReport?.()
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-72 overflow-hidden">
      {/* Top banner */}
      <div className="h-16 bg-gradient-to-r from-slate-700 to-slate-600" />

      <div className="px-5 pb-5 -mt-8">
        {/* Avatar */}
        <div className="flex items-end justify-between mb-3">
          <div className="bg-slate-600 rounded-full p-2 border-4 border-slate-800 inline-flex">
            <UserCircle size={40} className="text-slate-300" />
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        <h3 className="text-white font-bold text-lg leading-tight">{playerName}</h3>
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className="text-slate-400 text-sm">Level {level}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {!friendAdded ? (
            <button
              onClick={handleAddFriend}
              className="flex items-center gap-1.5 flex-1 justify-center bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm py-2 rounded-lg transition-colors"
            >
              <UserPlus size={15} /> Add Friend
            </button>
          ) : (
            <div className="flex items-center gap-1.5 flex-1 justify-center bg-green-500/10 border border-green-500/30 text-green-400 font-semibold text-sm py-2 rounded-lg">
              <UserPlus size={15} /> Friend Added
            </div>
          )}

          {!reported ? (
            <button
              onClick={() => setReportConfirm((v) => !v)}
              className="flex items-center gap-1 bg-slate-700 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 border border-slate-600 text-slate-400 font-semibold text-sm px-3 py-2 rounded-lg transition-colors"
            >
              <Flag size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-1 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
              <Flag size={14} /> Reported
            </div>
          )}
        </div>

        {/* Report confirmation */}
        {reportConfirm && (
          <div className="mt-3 bg-slate-900 border border-red-500/30 rounded-xl p-3">
            <p className="text-sm text-white font-semibold mb-1">Report {playerName}?</p>
            <p className="text-xs text-slate-400 mb-3">This player will be flagged for review.</p>
            <div className="flex gap-2">
              <button
                onClick={handleReportConfirm}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs py-1.5 rounded-lg transition-colors"
              >
                Yes, Report
              </button>
              <button
                onClick={() => setReportConfirm(false)}
                className="flex-1 flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs py-1.5 rounded-lg transition-colors"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
