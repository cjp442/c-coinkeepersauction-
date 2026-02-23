import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, RefreshCw } from 'lucide-react'
import { Auction, AuctionCategory } from '../types'
import { getAuctions, refreshAllAuctionStatuses } from '../services/auctionService'
import AuctionCard from '../components/AuctionCard'
import LiveAuctionRoom from '../components/LiveAuctionRoom'
import { useAuth } from '../contexts/AuthContext'

const CATEGORIES: { label: string; value: AuctionCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: '🪙 Coins', value: 'coins' },
  { label: '🏆 Bullion', value: 'bullion' },
  { label: '🎖️ Collectibles', value: 'collectibles' },
  { label: '💍 Jewelry', value: 'jewelry' },
  { label: '🎨 Art', value: 'art' },
  { label: '📦 Other', value: 'other' },
]

const STATUSES: { label: string; value: Auction['status'] | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: '🔴 Live', value: 'active' },
  { label: '🕐 Upcoming', value: 'pending' },
  { label: '✅ Ended', value: 'ended' },
  { label: '💰 Sold', value: 'sold' },
]

export default function AuctionsPage() {
  const { user } = useAuth()
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [allActive, setAllActive] = useState(0)
  const [allPending, setAllPending] = useState(0)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<AuctionCategory | 'all'>('all')
  const [status, setStatus] = useState<Auction['status'] | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAuctions = () => {
    setLoading(true)
    refreshAllAuctionStatuses()
    const all = getAuctions()
    setAllActive(all.filter((a) => a.status === 'active').length)
    setAllPending(all.filter((a) => a.status === 'pending').length)
    const results = all.filter((a) => {
      if (status !== 'all' && a.status !== status) return false
      if (category !== 'all' && a.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.host_name.toLowerCase().includes(q)
        )
      }
      return true
    })
    setAuctions(results.sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime()))
    setLoading(false)
  }

  useEffect(() => {
    fetchAuctions()
    // Poll every 10s to update countdowns / statuses
    const interval = setInterval(fetchAuctions, 10000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status])

  const liveCount = allActive
  const upcomingCount = allPending

  if (selectedId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LiveAuctionRoom auctionId={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Auctions</h1>
          <p className="text-slate-400 mt-1">
            {liveCount > 0 && (
              <span className="text-red-400 font-medium">{liveCount} live </span>
            )}
            {upcomingCount > 0 && (
              <span className="text-blue-400 font-medium">{upcomingCount} upcoming </span>
            )}
            auction{liveCount + upcomingCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAuctions}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          {(user?.role === 'host' || user?.role === 'admin') && (
            <Link
              to="/auctions/create"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition text-sm font-medium"
            >
              <Plus size={14} /> Create Auction
            </Link>
          )}
        </div>
      </div>

      {/* Search + filters */}
      <div className="bg-slate-800 rounded-lg p-4 mb-6 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search auctions, items, hosts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap items-center">
          <Filter size={14} className="text-slate-400 shrink-0" />
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`text-xs px-3 py-1.5 rounded-full transition ${
                category === c.value
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`text-xs px-3 py-1.5 rounded-full transition ${
                status === s.value
                  ? 'bg-slate-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auction grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800 rounded-lg h-72 animate-pulse" />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg">No auctions found</p>
          <p className="text-slate-500 text-sm mt-2">Try adjusting your filters or check back soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              onViewDetails={(id) => setSelectedId(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

