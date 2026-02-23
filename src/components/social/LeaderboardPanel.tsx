import { useState } from 'react'
import { X, Trophy } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  level: number
}

const TOP_SPENDERS: LeaderboardEntry[] = [
  { rank: 1, name: 'GoldKing99', score: 125000, level: 88 },
  { rank: 2, name: 'VelvetQueen', score: 98700, level: 75 },
  { rank: 3, name: 'NeonRacer', score: 74500, level: 63 },
  { rank: 4, name: 'ShadowBid', score: 51200, level: 57 },
  { rank: 5, name: 'PixelPrince', score: 43800, level: 50 },
  { rank: 6, name: 'CryptoAce', score: 39100, level: 47 },
  { rank: 7, name: 'ArcadeWizard', score: 31600, level: 42 },
  { rank: 8, name: 'LootMaster', score: 24000, level: 38 },
  { rank: 9, name: 'TokenTitan', score: 18500, level: 33 },
  { rank: 10, name: 'SlotKnight', score: 12200, level: 28 },
]

const TOP_PLAYERS: LeaderboardEntry[] = [
  { rank: 1, name: 'ArcadeWizard', score: 9850, level: 100 },
  { rank: 2, name: 'PixelPrince', score: 8700, level: 95 },
  { rank: 3, name: 'NeonRacer', score: 7900, level: 90 },
  { rank: 4, name: 'GoldKing99', score: 6800, level: 88 },
  { rank: 5, name: 'VelvetQueen', score: 5900, level: 75 },
  { rank: 6, name: 'CryptoAce', score: 5100, level: 70 },
  { rank: 7, name: 'LootMaster', score: 4400, level: 65 },
  { rank: 8, name: 'ShadowBid', score: 3700, level: 57 },
  { rank: 9, name: 'TokenTitan', score: 3100, level: 50 },
  { rank: 10, name: 'SlotKnight', score: 2500, level: 45 },
]

const RANK_STYLES: Record<number, string> = {
  1: 'text-yellow-400 font-extrabold',
  2: 'text-slate-300 font-bold',
  3: 'text-amber-600 font-bold',
}

const RANK_ROW_BG: Record<number, string> = {
  1: 'bg-yellow-500/10 border-yellow-500/20',
  2: 'bg-slate-500/10 border-slate-500/20',
  3: 'bg-amber-700/10 border-amber-700/20',
}

type Tab = 'spenders' | 'players'

interface Props {
  onClose?: () => void
}

export default function LeaderboardPanel({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('spenders')

  const entries = tab === 'spenders' ? TOP_SPENDERS : TOP_PLAYERS
  const scoreLabel = tab === 'spenders' ? 'Tokens Spent' : 'Points'

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-amber-400" />
          <h2 className="text-xl font-bold text-amber-400">Leaderboard</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {(['spenders', 'players'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === t
                ? 'text-amber-400 border-b-2 border-amber-400 -mb-px'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'spenders' ? '💸 Top Spenders' : '🎮 Top Players'}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 text-xs text-slate-500 uppercase tracking-wide px-4 py-2 font-semibold">
        <span className="col-span-1">#</span>
        <span className="col-span-5">Player</span>
        <span className="col-span-4 text-right">{scoreLabel}</span>
        <span className="col-span-2 text-right">Lvl</span>
      </div>

      {/* Entries */}
      <div className="px-3 pb-4 space-y-1">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-xl border ${
              RANK_ROW_BG[entry.rank] ?? 'border-transparent'
            }`}
          >
            <span className={`col-span-1 text-sm ${RANK_STYLES[entry.rank] ?? 'text-slate-400'}`}>
              {entry.rank}
            </span>
            <div className="col-span-5 flex items-center gap-2">
              {entry.rank === 1 && <span className="text-base">🥇</span>}
              {entry.rank === 2 && <span className="text-base">🥈</span>}
              {entry.rank === 3 && <span className="text-base">🥉</span>}
              <span className={`text-sm ${entry.rank <= 3 ? 'text-white font-semibold' : 'text-slate-300'}`}>
                {entry.name}
              </span>
            </div>
            <span className={`col-span-4 text-right text-sm font-semibold ${entry.rank <= 3 ? 'text-amber-400' : 'text-slate-300'}`}>
              {entry.score.toLocaleString()}
            </span>
            <span className="col-span-2 text-right text-xs text-slate-400">{entry.level}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
