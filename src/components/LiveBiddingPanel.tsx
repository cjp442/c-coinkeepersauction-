// src/components/LiveBiddingPanel.tsx
// Viewer panel: place bids, proxy bidding, bid history, notifications

import { useState, useEffect, useCallback } from 'react'
import { LiveAuction, LiveBid } from '../types'
import {
  placeBid,
  getMinBid,
  getBidsByAuction,
  getLiveAuctions,
  BID_INCREMENT,
} from '../services/liveAuctionService'
import { subscribe, emitNewBid, BidEvent } from '../services/streamBiddingService'

interface LiveBiddingPanelProps {
  auction: LiveAuction | null
  userId: string
  userName: string
  onAuctionUpdate: (updated: LiveAuction) => void
}

export default function LiveBiddingPanel({
  auction,
  userId,
  userName,
  onAuctionUpdate,
}: LiveBiddingPanelProps) {
  const [bidAmount, setBidAmount] = useState(0)
  const [maxBid, setMaxBid] = useState('')
  const [useProxy, setUseProxy] = useState(false)
  const [bids, setBids] = useState<LiveBid[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const refreshBids = useCallback(() => {
    if (auction) setBids(getBidsByAuction(auction.id))
  }, [auction])

  // Sync bid amount to minimum when auction changes
  useEffect(() => {
    if (auction) {
      setBidAmount(getMinBid(auction))
      refreshBids()
    }
  }, [auction, refreshBids])

  // Subscribe to real-time events for this auction
  useEffect(() => {
    if (!auction) return

    const unsub = subscribe(auction.id, (event: BidEvent) => {
      if (event.type === 'new_bid' && event.auction) {
        onAuctionUpdate(event.auction)
        setBids(getBidsByAuction(auction.id))
        setBidAmount(getMinBid(event.auction))
      }
    })

    const unsubUser = subscribe(`user_${userId}`, (event: BidEvent) => {
      if (event.type === 'outbid' && event.message) {
        setNotification(event.message)
        setTimeout(() => setNotification(null), 6000)
      }
      if (event.type === 'won' && event.message) {
        setNotification(event.message)
        setTimeout(() => setNotification(null), 10000)
      }
    })

    return () => {
      unsub()
      unsubUser()
    }
  }, [auction, userId, onAuctionUpdate])

  const handleBid = () => {
    if (!auction || submitting) return
    setError(null)
    setSubmitting(true)

    try {
      const prevBidderId = auction.current_bidder_id
      const proxyMax = useProxy && maxBid ? parseFloat(maxBid) : undefined

      const winningBid = placeBid(auction.id, userId, userName, bidAmount, proxyMax)

      // Re-read updated auction from storage
      const updated = getLiveAuctions().find(a => a.id === auction.id)
      if (updated) {
        emitNewBid(updated, winningBid, prevBidderId)
        onAuctionUpdate(updated)
        setBids(getBidsByAuction(auction.id))
        setBidAmount(getMinBid(updated))
      }
      setMaxBid('')
      setUseProxy(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bid')
    } finally {
      setSubmitting(false)
    }
  }

  if (!auction) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 text-center text-slate-400">
        <p className="text-lg">No active auction right now.</p>
        <p className="text-sm mt-1">Wait for the host to start an auction.</p>
      </div>
    )
  }

  const isEnded = auction.status !== 'active'
  const minBid = getMinBid(auction)
  const isMyBid = auction.current_bidder_id === userId

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-700 px-4 py-3 flex items-center justify-between">
        <h3 className="font-bold text-white truncate">{auction.item_title}</h3>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isEnded ? 'bg-slate-600' : 'bg-green-600 animate-pulse'
          }`}
        >
          {isEnded ? 'ENDED' : 'LIVE'}
        </span>
      </div>

      {/* Current bid display */}
      <div className="px-4 py-4 border-b border-slate-700">
        <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
          {auction.current_bid > 0 ? 'Current Bid' : 'Starting Bid'}
        </p>
        <p className="text-amber-400 font-bold text-3xl">
          {auction.current_bid > 0 ? auction.current_bid : auction.starting_price}{' '}
          <span className="text-sm font-normal text-slate-300">tokens</span>
        </p>
        {isMyBid && !isEnded && (
          <p className="text-green-400 text-sm mt-1 font-medium">✓ You're the highest bidder!</p>
        )}
        {auction.current_bidder_name && !isMyBid && !isEnded && (
          <p className="text-slate-400 text-sm mt-1">Highest: {auction.current_bidder_name}</p>
        )}
        <div className="flex gap-4 mt-2 text-xs text-slate-500">
          <span>🏷 {auction.bid_count} bids</span>
          <span>👁 {auction.view_count} views</span>
        </div>
      </div>

      {/* Outbid / Won notification */}
      {notification && (
        <div
          className={`mx-4 mt-3 px-3 py-2 rounded-lg text-sm font-medium ${
            notification.startsWith('🎉')
              ? 'bg-green-800 text-green-200'
              : 'bg-red-800/60 text-red-200'
          }`}
        >
          {notification}
        </div>
      )}

      {/* Bidding controls */}
      {!isEnded ? (
        <div className="px-4 py-4">
          {/* Quick-bid buttons */}
          <div className="flex gap-2 mb-3">
            {[0, 1, 2, 3].map(extra => (
              <button
                key={extra}
                onClick={() => setBidAmount(minBid + extra * BID_INCREMENT)}
                className={`flex-1 py-1.5 text-sm rounded-lg border transition ${
                  bidAmount === minBid + extra * BID_INCREMENT
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-amber-500'
                }`}
              >
                +{extra === 0 ? 'Min' : `+${extra * BID_INCREMENT}`}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={bidAmount}
              min={minBid}
              step={BID_INCREMENT}
              onChange={e => setBidAmount(Number(e.target.value))}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder={`Min ${minBid}`}
            />
            <span className="self-center text-slate-400 text-sm">tokens</span>
          </div>

          {/* Proxy bidding toggle */}
          <div className="mb-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input
                type="checkbox"
                checked={useProxy}
                onChange={e => setUseProxy(e.target.checked)}
                className="rounded"
              />
              <span>Proxy bidding (auto-bid up to max)</span>
            </label>
            {useProxy && (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  value={maxBid}
                  min={bidAmount}
                  step={BID_INCREMENT}
                  onChange={e => setMaxBid(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Max bid amount"
                />
                <span className="self-center text-slate-400 text-sm">tokens</span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-2">{error}</p>
          )}

          <button
            onClick={handleBid}
            disabled={submitting || bidAmount < minBid}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition text-base"
          >
            {submitting ? 'Placing Bid…' : `Bid ${bidAmount} Tokens`}
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 text-center">
          {auction.status === 'sold' ? (
            <div>
              <p className="text-2xl mb-1">🔨</p>
              <p className="text-amber-400 font-bold">
                Sold for {auction.final_price} tokens
              </p>
              {auction.winner_name && (
                <p className="text-slate-300 text-sm mt-1">Won by {auction.winner_name}</p>
              )}
            </div>
          ) : (
            <p className="text-slate-400">Auction ended — no bids.</p>
          )}
        </div>
      )}

      {/* Bid history */}
      {bids.length > 0 && (
        <div className="border-t border-slate-700 px-4 py-3">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Bid History</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {bids.map(bid => (
              <div
                key={bid.id}
                className={`flex items-center justify-between text-sm px-2 py-1 rounded ${
                  bid.bidder_id === userId ? 'bg-amber-900/30' : ''
                }`}
              >
                <span className="text-slate-300 flex items-center gap-1">
                  {bid.is_proxy && <span className="text-amber-500 text-xs">⚡</span>}
                  {bid.bidder_name}
                </span>
                <span className="text-amber-400 font-semibold">{bid.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
