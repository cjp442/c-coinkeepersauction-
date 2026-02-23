import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { LeaderboardEntry, LeaderboardCategory, PlayerTier } from '../types'

const TIER_COLOURS: Record<PlayerTier, string> = {
  bronze: 'text-amber-700',
  silver: 'text-gray-400',
  gold: 'text-yellow-400',
  platinum: 'text-cyan-300',
  diamond: 'text-blue-400',
}

const TIER_ICONS: Record<PlayerTier, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  diamond: '💠',
}

function getTier(rank: number): PlayerTier {
  if (rank === 1) return 'diamond'
  if (rank <= 3) return 'platinum'
  if (rank <= 10) return 'gold'
  if (rank <= 25) return 'silver'
  return 'bronze'
}

interface LeaderboardPanelProps {
  onClose?: () => void
}

const CATEGORIES: { key: LeaderboardCategory; label: string }[] = [
  { key: 'top_spenders', label: 'Top Spenders' },
  { key: 'most_wins', label: 'Most Wins' },
  { key: 'highest_bids', label: 'Highest Bids' },
]

const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ onClose }) => {
  const [category, setCategory] = useState<LeaderboardCategory>('top_spenders')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('category', category)
        .order('score', { ascending: false })
        .limit(50)

      if (!error && data) {
        const ranked = (data as Omit<LeaderboardEntry, 'rank' | 'tier'>[]).map((row, idx) => ({
          ...row,
          rank: idx + 1,
          tier: getTier(idx + 1),
        }))
        setEntries(ranked)
      }
      setLoading(false)
    }

    fetchLeaderboard()

    // Live updates
    const sub = supabase
      .channel('leaderboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard_entries' }, () => {
        fetchLeaderboard()
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [category])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-yellow-500/40 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-500/30">
          <h2 className="text-xl font-bold text-yellow-400">🏆 Leaderboard</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
              aria-label="Close leaderboard"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex border-b border-gray-700">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                category === key
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Entries */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">Loading…</div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">No data yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase">
                  <th className="px-4 py-2 text-left w-12">#</th>
                  <th className="px-4 py-2 text-left">Player</th>
                  <th className="px-4 py-2 text-right">Score</th>
                  <th className="px-4 py-2 text-right w-20">Tier</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.user_id}
                    className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 font-mono">{entry.rank}</td>
                    <td className="px-4 py-3 text-white font-medium">{entry.username}</td>
                    <td className="px-4 py-3 text-right text-yellow-300 font-mono">
                      {entry.score.toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 text-right ${TIER_COLOURS[entry.tier]}`}>
                      {TIER_ICONS[entry.tier]}{' '}
                      <span className="capitalize">{entry.tier}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPanel
