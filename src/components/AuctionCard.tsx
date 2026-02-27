import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Clock, Eye, Gavel, TrendingUp, Star } from 'lucide-react'
import { Auction, AuctionCategory } from '../types'

const CATEGORY_EMOJI: Record<AuctionCategory, string> = {
  coins: '🪙',
  bullion: '🏆',
  collectibles: '🎖️',
  jewelry: '💍',
  art: '🎨',
  other: '📦',
}

function useCountdown(endsAt: string) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endsAt))

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(endsAt)), 1000)
    return () => clearInterval(interval)
  }, [endsAt])

  return timeLeft
}

function getTimeLeft(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now()
  if (diff <= 0) return null
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds, diff }
}

function CountdownBadge({ endsAt, status }: { endsAt: string; status: Auction['status'] }) {
  const timeLeft = useCountdown(endsAt)

  if (status === 'ended' || status === 'sold' || status === 'cancelled') {
    const label = status === 'sold' ? 'Sold' : status === 'cancelled' ? 'Cancelled' : 'Ended'
    return <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">{label}</span>
  }

  if (status === 'pending') {
    return (
      <span className="text-xs bg-blue-700 text-blue-100 px-2 py-1 rounded flex items-center gap-1">
        <Clock size={10} /> Upcoming
      </span>
    )
  }

  if (!timeLeft) {
    return <span className="text-xs bg-red-700 text-red-100 px-2 py-1 rounded">Ended</span>
  }

  const urgent = timeLeft.diff <= 300000 // < 5 min
  const formatted =
    timeLeft.days > 0
      ? `${timeLeft.days}d ${timeLeft.hours}h`
      : timeLeft.hours > 0
        ? `${timeLeft.hours}h ${timeLeft.minutes}m`
        : `${timeLeft.minutes}m ${timeLeft.seconds}s`

  return (
    <span
      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
        urgent ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-700 text-amber-100'
      }`}
    >
      <Clock size={10} /> {formatted}
    </span>
  )
}

interface AuctionCardProps {
  auction: Auction
  onViewDetails?: (id: string) => void
}

export default function AuctionCard({ auction, onViewDetails }: AuctionCardProps) {
  const emoji = CATEGORY_EMOJI[auction.category] ?? '📦'

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-750 transition border border-slate-700 hover:border-amber-600 flex flex-col">
      {/* Image / emoji area */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 h-32 flex items-center justify-center relative">
        {auction.image_url ? (
          <img src={auction.image_url} alt={auction.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-5xl">{emoji}</span>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {auction.is_featured && (
            <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
              <Star size={10} /> Featured
            </span>
          )}
          <CountdownBadge endsAt={auction.ends_at} status={auction.status} />
        </div>
        {auction.status === 'active' && !auction.reserve_met && (
          <div className="absolute bottom-2 left-2">
            <span className="text-xs bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded">Reserve not met</span>
          </div>
        )}
        {auction.status === 'active' && auction.reserve_met && (
          <div className="absolute bottom-2 left-2">
            <span className="text-xs bg-green-800/80 text-green-200 px-2 py-0.5 rounded">Reserve met ✓</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{auction.category}</div>
        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">{auction.title}</h3>
        <p className="text-slate-400 text-xs mb-3 line-clamp-2 flex-1">{auction.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Current Bid</span>
            <span className="text-amber-500 font-bold">{auction.current_bid.toLocaleString()} tokens</span>
          </div>
          {auction.highest_bidder_name && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Top Bidder</span>
              <span className="text-white text-xs">{auction.highest_bidder_name}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Gavel size={10} /> {auction.bid_count} bids
            </span>
            <span className="flex items-center gap-1">
              <Eye size={10} /> {auction.view_count} views
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={10} /> by {auction.host_name}
            </span>
          </div>
        </div>

        <div className="mt-4">
          {onViewDetails ? (
            <button
              onClick={() => onViewDetails(auction.id)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 rounded transition"
            >
              {auction.status === 'active' ? 'Bid Now' : 'View Details'}
            </button>
          ) : (
            <Link
              to={`/auctions`}
              className="block w-full text-center bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 rounded transition"
            >
              {auction.status === 'active' ? 'Bid Now' : 'View Details'}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
