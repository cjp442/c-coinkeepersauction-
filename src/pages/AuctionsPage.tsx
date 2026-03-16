import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuctionRoom from '../components/AuctionRoom'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import AuthModal from '../components/AuthModal'

interface AuctionListing {
  id: string
  title: string
  description: string
  startingBid: number
  image: string
  category: string
  endsIn: string
}

const MOCK_AUCTIONS: AuctionListing[] = [
  {
    id: 'auction-1',
    title: '1921 Morgan Silver Dollar MS-64',
    description: 'Beautiful Morgan Dollar in near-mint condition. Great luster, minimal marks.',
    startingBid: 125,
    image: '🪙',
    category: 'Silver',
    endsIn: '2h 14m',
  },
  {
    id: 'auction-2',
    title: '1 oz Gold American Eagle',
    description: 'Official US Mint bullion coin, .9167 fine gold. BU condition.',
    startingBid: 2500,
    image: '🏆',
    category: 'Gold',
    endsIn: '4h 55m',
  },
  {
    id: 'auction-3',
    title: 'Silver Bullion Lot — 10 oz',
    description: 'Mixed silver rounds and bars. Great starter lot for new collectors.',
    startingBid: 350,
    image: '💎',
    category: 'Silver',
    endsIn: '1h 30m',
  },
  {
    id: 'auction-4',
    title: '1878 CC Morgan Dollar VF-30',
    description: 'Carson City mint Morgan Dollar. Well-worn but bold details.',
    startingBid: 200,
    image: '🏅',
    category: 'Silver',
    endsIn: '6h 02m',
  },
  {
    id: 'auction-5',
    title: '2024 Silver Maple Leaf BU',
    description: 'Royal Canadian Mint .9999 fine silver, brilliant uncirculated.',
    startingBid: 45,
    image: '🍁',
    category: 'Silver',
    endsIn: '3h 41m',
  },
  {
    id: 'auction-6',
    title: '1/10 oz Gold Krugerrand',
    description: 'South African gold Krugerrand in original mint capsule.',
    startingBid: 310,
    image: '⚜️',
    category: 'Gold',
    endsIn: '8h 20m',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Gold: 'bg-amber-600',
  Silver: 'bg-slate-500',
  Platinum: 'bg-cyan-700',
}

export default function AuctionsPage() {
  const { user } = useAuth()
  const { tokens } = useTokens()
  const [selectedAuction, setSelectedAuction] = useState<AuctionListing | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(MOCK_AUCTIONS.map((a) => a.category)))]
  const filtered =
    filterCategory === 'All'
      ? MOCK_AUCTIONS
      : MOCK_AUCTIONS.filter((a) => a.category === filterCategory)

  const handleEnter = (auction: AuctionListing) => {
    if (!user) {
      setShowAuth(true)
      return
    }
    setSelectedAuction(auction)
  }

  if (selectedAuction) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedAuction(null)}
          className="mb-6 text-slate-400 hover:text-white flex items-center gap-2 transition"
        >
          ← Back to Auctions
        </button>
        <AuctionRoom
          auctionId={selectedAuction.id}
          title={selectedAuction.title}
          startingBid={selectedAuction.startingBid}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold">Live Auctions</h1>
          <p className="text-slate-400 mt-1">Bid with Keeper Tokens. Winners pay in tokens.</p>
        </div>
        {tokens && (
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 px-4 py-2 rounded-lg text-sm font-bold">
              🪙 {tokens.balance.toLocaleString()} Tokens
            </div>
            <Link
              to="/tokens"
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition"
            >
              + Add Tokens
            </Link>
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filterCategory === cat
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Auction grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((auction) => (
          <div
            key={auction.id}
            className="bg-slate-800 rounded-xl overflow-hidden hover:bg-slate-750 transition border border-slate-700 hover:border-amber-600"
          >
            {/* Image area */}
            <div className="bg-slate-700 h-40 flex items-center justify-center text-6xl">
              {auction.image}
            </div>

            <div className="p-5">
              {/* Category badge */}
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${CATEGORY_COLORS[auction.category] ?? 'bg-slate-600'}`}
              >
                {auction.category}
              </span>

              <h3 className="font-bold text-lg mt-2 mb-1 leading-tight">{auction.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{auction.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-slate-500">Starting bid</div>
                  <div className="text-amber-400 font-bold text-lg">
                    {auction.startingBid.toLocaleString()} Tokens
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Ends in</div>
                  <div className="text-white font-semibold">{auction.endsIn}</div>
                </div>
              </div>

              <button
                onClick={() => handleEnter(auction)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg transition"
              >
                {user ? 'Enter & Bid' : 'Login to Bid'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!user && (
        <div className="mt-12 text-center bg-slate-800 rounded-xl p-8">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Login Required to Bid</h2>
          <p className="text-slate-400 mb-6">
            Create a free account to start bidding with Keeper Tokens.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-amber-600 hover:bg-amber-700 px-8 py-3 rounded-lg font-bold transition"
          >
            Create Account / Login
          </button>
        </div>
      )}

      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />}
    </div>
  )
}

