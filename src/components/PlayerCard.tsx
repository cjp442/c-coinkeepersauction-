import { useState } from 'react'
import { X, Flag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface PlayerCardProps {
  player: {
    id: string
    username: string
    role: string
    createdAt?: string
  }
  onClose: () => void
}

export default function PlayerCard({ player, onClose }: PlayerCardProps) {
  const [reported, setReported] = useState(false)

  const accountAge = player.createdAt
    ? formatDistanceToNow(new Date(player.createdAt), { addSuffix: true })
    : null

  const roleBadgeClass =
    player.role === 'admin'
      ? 'bg-red-900/60 text-red-300 border-red-700'
      : player.role === 'host'
        ? 'bg-amber-900/60 text-amber-300 border-amber-700'
        : 'bg-gray-700/60 text-gray-300 border-gray-600'

  return (
    <div className="w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 relative">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X size={16} />
      </button>

      {/* Avatar placeholder */}
      <div className="w-12 h-12 rounded-full bg-amber-700 flex items-center justify-center text-white text-xl font-bold mb-3">
        {player.username.charAt(0).toUpperCase()}
      </div>

      <h3 className="text-white font-semibold text-base leading-tight mb-1">{player.username}</h3>

      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${roleBadgeClass} mb-2`}>
        {player.role}
      </span>

      {accountAge && (
        <p className="text-gray-500 text-xs mb-3">Member {accountAge}</p>
      )}

      {/* Report button */}
      <button
        onClick={() => setReported(true)}
        disabled={reported}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 disabled:text-green-400 disabled:cursor-default transition-colors"
      >
        <Flag size={12} />
        {reported ? 'Report sent' : 'Report player'}
      </button>
    </div>
  )
}
