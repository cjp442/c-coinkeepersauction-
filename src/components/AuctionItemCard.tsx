// src/components/AuctionItemCard.tsx
// Displays a single auction item with current bid, bid count, and sold state

import { useState, useEffect } from 'react'
import { LiveAuction } from '../types'

interface AuctionItemCardProps {
  auction: LiveAuction
  isActive?: boolean
  onClick?: () => void
}

export default function AuctionItemCard({ auction, isActive = false, onClick }: AuctionItemCardProps) {
  const [gavelVisible, setGavelVisible] = useState(false)

  // Trigger gavel animation when item is sold
  useEffect(() => {
    if (auction.status === 'sold') {
      setGavelVisible(true)
      const timer = setTimeout(() => setGavelVisible(false), 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [auction.status])

  const statusColor =
    auction.status === 'active'
      ? 'bg-green-600'
      : auction.status === 'sold'
        ? 'bg-amber-600'
        : 'bg-slate-600'

  const statusLabel =
    auction.status === 'active' ? 'LIVE' : auction.status === 'sold' ? 'SOLD' : 'ENDED'

  return (
    <div
      onClick={onClick}
      className={`relative bg-slate-800 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
        isActive ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-slate-700 hover:border-slate-500'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Status badge */}
      <div className={`absolute top-3 right-3 ${statusColor} text-xs font-bold px-2 py-1 rounded-full z-10`}>
        {statusLabel}
      </div>

      {/* Gavel animation overlay */}
      {gavelVisible && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/60 animate-pulse">
          <div className="text-center">
            <span className="text-6xl animate-bounce">🔨</span>
            <p className="text-amber-400 font-bold text-xl mt-2">SOLD!</p>
          </div>
        </div>
      )}

      {/* Item image / placeholder */}
      <div className="h-32 bg-slate-700 flex items-center justify-center">
        {auction.item_image_url ? (
          <img
            src={auction.item_image_url}
            alt={auction.item_title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl">🪙</span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white text-lg leading-tight mb-1 truncate">
          {auction.item_title}
        </h3>
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{auction.item_description}</p>

        {/* Bid info */}
        {auction.status === 'sold' ? (
          <div>
            <p className="text-amber-400 font-bold text-xl">
              Final: {auction.final_price} tokens
            </p>
            {auction.winner_name && (
              <p className="text-slate-300 text-sm mt-1">🏆 Won by {auction.winner_name}</p>
            )}
          </div>
        ) : auction.current_bid > 0 ? (
          <p className="text-amber-400 font-bold text-xl">
            Current: {auction.current_bid} tokens
          </p>
        ) : (
          <p className="text-slate-300 font-semibold text-lg">
            Start: {auction.starting_price} tokens
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 text-slate-400 text-xs">
          <span>🏷 {auction.bid_count} bids</span>
          <span>👁 {auction.view_count} views</span>
          {auction.current_bidder_name && auction.status === 'active' && (
            <span className="text-green-400 truncate">↑ {auction.current_bidder_name}</span>
          )}
        </div>
      </div>
    </div>
  )
}
