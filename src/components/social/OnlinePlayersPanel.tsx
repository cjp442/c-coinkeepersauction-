import { useState } from 'react'
import { X, Search, Users } from 'lucide-react'
import PlayerCard from './PlayerCard'

interface OnlinePlayer {
  id: string
  name: string
  room: string
  level: number
  status: 'online' | 'vip'
}

const MOCK_PLAYERS: OnlinePlayer[] = [
  { id: 'p1', name: 'GoldKing99', room: 'VIP Lounge', level: 88, status: 'vip' },
  { id: 'p2', name: 'NeonRacer', room: 'Arcade Hall', level: 63, status: 'online' },
  { id: 'p3', name: 'VelvetQueen', room: 'Lobby', level: 75, status: 'vip' },
  { id: 'p4', name: 'PixelPrince', room: 'Game Room 3', level: 50, status: 'online' },
  { id: 'p5', name: 'CryptoAce', room: 'Auction House', level: 47, status: 'online' },
  { id: 'p6', name: 'ArcadeWizard', room: 'Arcade Hall', level: 100, status: 'online' },
  { id: 'p7', name: 'LootMaster', room: 'Lobby', level: 38, status: 'online' },
  { id: 'p8', name: 'SlotKnight', room: 'Slot Parlor', level: 28, status: 'online' },
]

interface Props {
  onClose?: () => void
}

export default function OnlinePlayersPanel({ onClose }: Props) {
  const [search, setSearch] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<OnlinePlayer | null>(null)

  const filtered = MOCK_PLAYERS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.room.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm mx-auto flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-green-400" />
          <h2 className="text-lg font-bold text-white">Online Players</h2>
          <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full border border-green-500/30">
            {MOCK_PLAYERS.length}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search players or rooms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Player list */}
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No players found</p>
        ) : (
          filtered.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelectedPlayer((prev) => (prev?.id === player.id ? null : player))}
              className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-800 transition-colors text-left border-b border-slate-800 ${
                selectedPlayer?.id === player.id ? 'bg-slate-800' : ''
              }`}
            >
              {/* Green dot */}
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  player.status === 'vip' ? 'bg-amber-400' : 'bg-green-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{player.name}</p>
                <p className="text-xs text-slate-400 truncate">📍 {player.room}</p>
              </div>
              <span className="text-xs text-slate-500 shrink-0">Lv.{player.level}</span>
              {player.status === 'vip' && (
                <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                  VIP
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Inline PlayerCard */}
      {selectedPlayer && (
        <div className="border-t border-slate-700 p-4 shrink-0">
          <PlayerCard
            playerId={selectedPlayer.id}
            playerName={selectedPlayer.name}
            level={selectedPlayer.level}
            status={selectedPlayer.status}
          />
        </div>
      )}
    </div>
  )
}
