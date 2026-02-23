// src/components/StreamAuctionOverlay.tsx
// Compact overlay showing the current auction status on the live stream

import { LiveAuction } from '../types'

interface StreamAuctionOverlayProps {
  auction: LiveAuction | null
  sessionTitle: string
  viewerCount: number
}

export default function StreamAuctionOverlay({
  auction,
  sessionTitle,
  viewerCount,
}: StreamAuctionOverlayProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
      {/* Stream info bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">
            ● LIVE
          </span>
          <span className="text-white font-semibold text-sm drop-shadow">{sessionTitle}</span>
        </div>
        <span className="text-white/80 text-xs">👁 {viewerCount} watching</span>
      </div>

      {/* Active auction info bar */}
      {auction && auction.status === 'active' && (
        <div className="bg-black/70 backdrop-blur-sm px-4 py-3 border-t border-amber-500/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-wide">
                🔨 Auction Live
              </p>
              <p className="text-white font-semibold text-sm truncate max-w-xs">
                {auction.item_title}
              </p>
            </div>
            <div className="text-right">
              <p className="text-amber-400 font-bold text-xl">
                {auction.current_bid > 0 ? auction.current_bid : auction.starting_price}{' '}
                <span className="text-sm font-normal">tokens</span>
              </p>
              {auction.current_bidder_name && (
                <p className="text-slate-300 text-xs">by {auction.current_bidder_name}</p>
              )}
              <p className="text-slate-400 text-xs">{auction.bid_count} bids</p>
            </div>
          </div>
        </div>
      )}

      {/* Sold banner */}
      {auction && auction.status === 'sold' && (
        <div className="bg-amber-600/90 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-t border-amber-400">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔨</span>
            <div>
              <p className="text-white font-bold text-sm">SOLD — {auction.item_title}</p>
              {auction.winner_name && (
                <p className="text-amber-200 text-xs">Won by {auction.winner_name}</p>
              )}
            </div>
          </div>
          <p className="text-white font-bold text-lg">{auction.final_price} tokens</p>
        </div>
      )}
    </div>
  )
}
