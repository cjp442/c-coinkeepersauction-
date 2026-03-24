import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Eye, Radio, Search, Smartphone } from 'lucide-react'

interface StreamCard {
  id: string
  hostName: string
  title: string
  viewers: number
  category: 'auction' | 'game' | 'vip'
  isLive: boolean
  startedAt: string
}

const MOCK_STREAMS: StreamCard[] = [
  {
    id: 'stream-1',
    hostName: 'Doc Holliday',
    title: 'Frontier Antiques & Relics Auction',
    viewers: 312,
    category: 'auction',
    isLive: true,
    startedAt: '2h 14m ago',
  },
  {
    id: 'stream-2',
    hostName: 'Belle Starr',
    title: 'Vintage Jewelry & Gold Rush Finds',
    viewers: 87,
    category: 'auction',
    isLive: true,
    startedAt: '45m ago',
  },
  {
    id: 'stream-3',
    hostName: 'Wyatt Earp',
    title: 'Revolver Spin — Live Round Tonight!',
    viewers: 540,
    category: 'game',
    isLive: true,
    startedAt: '1h 02m ago',
  },
  {
    id: 'stream-4',
    hostName: 'Calamity Jane',
    title: 'VIP High-Stakes Card Draw',
    viewers: 203,
    category: 'vip',
    isLive: true,
    startedAt: '30m ago',
  },
  {
    id: 'stream-5',
    hostName: 'Jesse James',
    title: 'Sunday Saddles & Spurs Auction',
    viewers: 119,
    category: 'auction',
    isLive: true,
    startedAt: '3h 55m ago',
  },
  {
    id: 'stream-6',
    hostName: 'Bat Masterson',
    title: 'Saloon Games Night — Open Table',
    viewers: 64,
    category: 'game',
    isLive: true,
    startedAt: '18m ago',
  },
]

type FilterTab = 'all' | 'auction' | 'game' | 'vip'

const CATEGORY_LABELS: Record<StreamCard['category'], string> = {
  auction: 'Auction',
  game: 'Game',
  vip: 'VIP Room',
}

const CATEGORY_COLORS: Record<StreamCard['category'], string> = {
  auction: 'bg-amber-700 text-amber-100',
  game: 'bg-emerald-800 text-emerald-100',
  vip: 'bg-red-900 text-red-200',
}

function StreamCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 overflow-hidden animate-pulse">
      <div className="h-40 bg-slate-700" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-700 rounded w-1/2" />
        <div className="h-8 bg-slate-700 rounded mt-3" />
      </div>
    </div>
  )
}

export default function LiveStreamPage() {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [followed, setFollowed] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const toggleFollow = (id: string) => {
    setFollowed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = MOCK_STREAMS.filter(s => {
    const matchesTab = filter === 'all' || s.category === filter
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.hostName.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All Live' },
    { key: 'auction', label: 'Auctions' },
    { key: 'game', label: 'Games' },
    { key: 'vip', label: 'VIP Rooms' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Radio className="w-6 h-6 text-red-500 animate-pulse" />
          <h1 className="text-4xl font-bold text-amber-400 tracking-wide font-serif">
            Live at The Saloon
          </h1>
          <Radio className="w-6 h-6 text-red-500 animate-pulse" />
        </div>
        <p className="text-slate-400 text-lg">
          Join a live auction or show happening right now
        </p>
        <div className="mt-2 text-amber-600 text-sm tracking-widest">
          ✦ ═══════════════════ ✦
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search streams or hosts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                filter === tab.key
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-700 hover:text-amber-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stream Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <StreamCardSkeleton key={i} />)
            : filtered.map(stream => (
                <div
                  key={stream.id}
                  className="rounded-lg border border-slate-700 bg-slate-800 overflow-hidden hover:border-amber-600 transition-all hover:shadow-lg hover:shadow-amber-900/20 group"
                >
                  {/* Thumbnail area */}
                  <div className="relative h-40 bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                    <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
                      {stream.category === 'auction' ? '🏷️' : stream.category === 'game' ? '🎲' : '⭐'}
                    </span>
                    {/* Live badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </div>
                    {/* Follow button */}
                    <button
                      onClick={() => toggleFollow(stream.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 transition-colors"
                      aria-label={followed.has(stream.id) ? 'Unfollow' : 'Follow'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-all ${
                          followed.has(stream.id)
                            ? 'fill-red-500 text-red-500 scale-110'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                    {/* Viewer count */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-slate-300 bg-slate-900/70 px-2 py-0.5 rounded">
                      <Eye className="w-3 h-3" />
                      {stream.viewers.toLocaleString()}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs text-amber-500 font-medium">{stream.hostName}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_COLORS[stream.category]}`}
                      >
                        {CATEGORY_LABELS[stream.category]}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 mb-1 leading-snug">
                      {stream.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">Started {stream.startedAt}</p>
                    <Link
                      to={`/live/${stream.id}`}
                      className="block w-full text-center bg-amber-700 hover:bg-amber-600 text-white text-sm font-semibold py-1.5 rounded transition-colors"
                    >
                      Watch Now
                    </Link>
                  </div>
                </div>
              ))}

          {!isLoading && filtered.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-12">
              No streams match your search. Check back soon, partner.
            </div>
          )}
        </div>

        {/* Host Banner */}
        <div className="border border-amber-700/50 rounded-lg bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-6 flex flex-col sm:flex-row items-center gap-4">
          <Smartphone className="w-10 h-10 text-amber-500 shrink-0" />
          <div className="text-center sm:text-left">
            <h3 className="text-amber-300 font-bold text-lg font-serif">
              Stream from your phone
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Got something to sell? Stream live from your phone or desktop.{' '}
              <Link to="/apply-host" className="text-amber-400 hover:underline">
                Apply as a Host
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
