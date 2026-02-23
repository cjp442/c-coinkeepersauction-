import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft, Eye, Users, Share2 } from 'lucide-react'
import { Auction, Bid } from '../types'
import { getAuction, incrementViewCount, subscribeToAuction, subscribeToBids } from '../services/auctionService'
import BiddingPanel from './BiddingPanel'
import AuctionHistory from './AuctionHistory'

interface LiveAuctionRoomProps {
  auctionId: string
  onBack?: () => void
}

export default function LiveAuctionRoom({ auctionId, onBack }: LiveAuctionRoomProps) {
  const [auction, setAuction] = useState<Auction | null>(() => getAuction(auctionId) ?? null)
  const [recentBids, setRecentBids] = useState<Bid[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Increment view count once per session per auction
  useEffect(() => {
    const key = `auction_viewed_${auctionId}`
    if (!sessionStorage.getItem(key)) {
      incrementViewCount(auctionId)
      sessionStorage.setItem(key, '1')
    }
  }, [auctionId])

  // Subscribe to live auction updates
  useEffect(() => {
    const unsubAuction = subscribeToAuction(auctionId, (updated) => setAuction(updated))
    const unsubBids = subscribeToBids(auctionId, (bid) => {
      setRecentBids((prev) => [bid, ...prev].slice(0, 5))
      setAuction(getAuction(auctionId) ?? null)
    })
    return () => {
      unsubAuction()
      unsubBids()
    }
  }, [auctionId])

  const handleBidPlaced = useCallback(() => {
    setAuction(getAuction(auctionId) ?? null)
  }, [auctionId])

  if (!auction) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Auction not found.</p>
      </div>
    )
  }

  const isLive = auction.status === 'active'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white transition"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isLive && (
              <span className="flex items-center gap-1 text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
            )}
            <span className="text-xs text-slate-400 uppercase">{auction.category}</span>
          </div>
          <h1 className="text-xl font-bold text-white truncate">{auction.title}</h1>
          <p className="text-sm text-slate-400">Hosted by {auction.host_name}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Eye size={14} /> {auction.view_count}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {auction.bid_count} bids
          </span>
          <button className="hover:text-white transition" title="Share">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: item details + recent bids feed */}
        <div className="md:col-span-2 space-y-6">
          {/* Item image / emoji */}
          <div className="bg-slate-800 rounded-lg p-6 flex items-center justify-center h-48 text-7xl">
            {auction.image_url ? (
              <img src={auction.image_url} alt={auction.title} className="max-h-full object-contain rounded" />
            ) : (
              <span>
                {auction.category === 'coins'
                  ? '🪙'
                  : auction.category === 'bullion'
                    ? '🏆'
                    : auction.category === 'jewelry'
                      ? '💍'
                      : '📦'}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="bg-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">Description</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{auction.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{auction.current_bid.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Current Bid (tkn)</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{auction.bid_count}</p>
              <p className="text-xs text-slate-400 mt-1">Total Bids</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{auction.view_count}</p>
              <p className="text-xs text-slate-400 mt-1">Viewers</p>
            </div>
          </div>

          {/* Live bid feed */}
          {recentBids.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
              <ul className="space-y-2">
                {recentBids.map((bid) => (
                  <li key={bid.id} className="flex justify-between items-center text-sm animate-fade-in">
                    <span className="text-slate-300">
                      🔨 <strong>{bid.bidder_name}</strong> bid
                    </span>
                    <span className="text-amber-400 font-semibold">{bid.amount.toLocaleString()} tkn</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: bidding panel + history toggle */}
        <div className="space-y-4">
          <BiddingPanel auction={auction} onBidPlaced={handleBidPlaced} />

          <button
            onClick={() => setShowHistory((v) => !v)}
            className="w-full text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 py-2 rounded transition"
          >
            {showHistory ? 'Hide' : 'Show'} Bid History ({auction.bid_count})
          </button>

          {showHistory && <AuctionHistory auctionId={auctionId} />}
        </div>
      </div>
    </div>
  )
}
