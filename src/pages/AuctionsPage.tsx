import { useState } from 'react'
import { Gavel, Clock, Eye, Star } from 'lucide-react'
import FollowButton from '../components/FollowButton'

interface MockAuction {
  id: string
  title: string
  host: string
  hostId: string
  currentBid: number
  timeLeft: string
  viewers: number
  category: string
  isLive: boolean
}

const MOCK_AUCTIONS: MockAuction[] = [
  { id: 'a1', title: '1882 Morgan Silver Dollar — Near Mint', host: 'Doc Holloway', hostId: 'host-1', currentBid: 145, timeLeft: '12m 33s', viewers: 87, category: 'Silver', isLive: true },
  { id: 'a2', title: 'Gold Double Eagle Lot — 5 Coins', host: 'Miss Scarlett', hostId: 'host-2', currentBid: 2400, timeLeft: '45m 10s', viewers: 234, category: 'Gold', isLive: true },
  { id: 'a3', title: 'Seated Liberty Half Dollar 1870', host: 'Wyatt Goldsmith', hostId: 'host-3', currentBid: 320, timeLeft: '1h 22m', viewers: 52, category: 'Silver', isLive: false },
  { id: 'a4', title: 'Buffalo Nickel Collection — 12 pcs', host: 'Doc Holloway', hostId: 'host-1', currentBid: 95, timeLeft: '3h 5m', viewers: 29, category: 'Nickel', isLive: false },
  { id: 'a5', title: 'Carson City Mint Silver Bar 1oz', host: 'Belle Bonanza', hostId: 'host-4', currentBid: 55, timeLeft: '22m', viewers: 118, category: 'Silver', isLive: true },
  { id: 'a6', title: 'Indian Head Penny Set 1880–1899', host: 'Jessie James Jr.', hostId: 'host-5', currentBid: 210, timeLeft: '2h 48m', viewers: 41, category: 'Copper', isLive: false },
]

export default function AuctionsPage() {
  const [filter, setFilter] = useState<'all' | 'live' | 'gold' | 'silver'>('all')

  const filtered = MOCK_AUCTIONS.filter(a => {
    if (filter === 'live') return a.isLive
    if (filter === 'gold') return a.category === 'Gold'
    if (filter === 'silver') return a.category === 'Silver'
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-amber-400 flex items-center gap-3">
          <Gavel size={36} className="text-amber-500" />
          The Auction House
        </h1>
        <p className="text-slate-400 mt-2">Live and upcoming auctions — bid with Keeper Coins only</p>
        <div className="h-px bg-gradient-to-r from-amber-700 via-amber-500/50 to-transparent mt-4" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'live', 'gold', 'silver'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
              filter === f
                ? 'bg-amber-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {f === 'live' ? '🔴 Live Now' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Auction grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(auction => (
          <div
            key={auction.id}
            className="bg-slate-800 border border-slate-700 hover:border-amber-700/50 rounded-lg overflow-hidden transition group"
          >
            {/* Image placeholder */}
            <div className="bg-gradient-to-br from-amber-900/40 to-slate-800 h-36 flex items-center justify-center relative">
              <span className="text-5xl">🪙</span>
              {auction.isLive && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </span>
              )}
              <span className="absolute top-2 right-2 bg-slate-900/80 text-amber-400 text-xs px-2 py-0.5 rounded">
                {auction.category}
              </span>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-white text-sm leading-snug mb-2 group-hover:text-amber-300 transition">
                {auction.title}
              </h3>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Star size={12} />
                  <span>{auction.host}</span>
                </div>
                <FollowButton hostId={auction.hostId} hostName={auction.host} size="sm" />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs text-slate-500">Current Bid</p>
                  <p className="text-amber-400 font-bold">🪙 {auction.currentBid.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                    <Clock size={11} /> Time Left
                  </p>
                  <p className="text-white font-semibold">{auction.timeLeft}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Eye size={11} /> {auction.viewers} watching
                </span>
                <button className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-4 py-1.5 rounded transition">
                  Bid Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Keeper Coins notice */}
      <div className="mt-12 bg-slate-800/50 border border-amber-900/30 rounded-lg p-4 text-center">
        <p className="text-sm text-slate-400">
          🪙 All bids are placed using <span className="text-amber-400 font-semibold">Keeper Coins</span> —
          virtual currency only. No real money changes hands on this platform.
        </p>
      </div>
    </div>
  )
}

