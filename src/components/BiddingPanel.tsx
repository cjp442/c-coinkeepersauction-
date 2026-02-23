import { useEffect, useRef, useState } from 'react'
import { Gavel, Zap, Info } from 'lucide-react'
import { Auction } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useTokens } from '../contexts/TokenContext'
import { placeBid, placeProxyBid, getMinimumBid, getMinimumIncrement } from '../services/biddingService'
import { subscribeToAuction } from '../services/auctionService'

interface BiddingPanelProps {
  auction: Auction
  onBidPlaced?: (newBid: number) => void
}

export default function BiddingPanel({ auction: initialAuction, onBidPlaced }: BiddingPanelProps) {
  const { user } = useAuth()
  const { tokens, deductTokens } = useTokens()

  const [auction, setAuction] = useState<Auction>(initialAuction)
  const [bidAmount, setBidAmount] = useState('')
  const [proxyMax, setProxyMax] = useState('')
  const [useProxy, setUseProxy] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Subscribe to real-time auction updates
  useEffect(() => {
    const unsub = subscribeToAuction(initialAuction.id, (updated) => setAuction(updated))
    return unsub
  }, [initialAuction.id])

  // Keep in sync with parent
  useEffect(() => {
    setAuction(initialAuction)
  }, [initialAuction])

  const minBid = getMinimumBid(auction.id)
  const increment = getMinimumIncrement(auction.current_bid)
  const isOwner = user?.id === auction.host_id
  const isTopBidder = user?.id === auction.highest_bidder_id
  const canBid = auction.status === 'active' && user && !isOwner

  function showMessage(text: string, type: 'success' | 'error') {
    if (messageTimer.current) clearTimeout(messageTimer.current)
    setMessage({ text, type })
    messageTimer.current = setTimeout(() => setMessage(null), 4000)
  }

  async function handleBid(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !canBid) return

    const amount = parseInt(useProxy ? proxyMax : bidAmount, 10)
    if (isNaN(amount) || amount <= 0) {
      showMessage('Please enter a valid amount', 'error')
      return
    }
    if (tokens && tokens.balance < amount) {
      showMessage(`Insufficient tokens. You have ${tokens.balance} tokens.`, 'error')
      return
    }

    setLoading(true)
    const result = useProxy
      ? placeProxyBid(auction.id, user.id, user.username, amount)
      : placeBid(auction.id, user.id, user.username, amount)

    if (result.success && result.bid) {
      await deductTokens(result.bid.amount, `Bid on ${auction.title}`)
      setAuction((prev) => ({
        ...prev,
        current_bid: result.newCurrentBid ?? result.bid!.amount,
        highest_bidder_id: user.id,
        highest_bidder_name: user.username,
        bid_count: prev.bid_count + 1,
      }))
      showMessage(
        `Bid of ${result.bid.amount} tokens placed successfully!${useProxy ? ` (proxy max: ${amount})` : ''}`,
        'success',
      )
      setBidAmount('')
      setProxyMax('')
      onBidPlaced?.(result.newCurrentBid ?? result.bid.amount)
    } else {
      showMessage(result.error ?? 'Failed to place bid', 'error')
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <Gavel size={32} className="mx-auto mb-3 text-amber-500" />
        <p className="text-slate-300 mb-2">Sign in to place a bid</p>
      </div>
    )
  }

  if (auction.status !== 'active') {
    const labels: Record<string, string> = {
      pending: 'This auction has not started yet.',
      ended: 'This auction has ended.',
      sold: 'This item has been sold.',
      cancelled: 'This auction was cancelled.',
    }
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <p className="text-slate-400">{labels[auction.status] ?? 'Auction unavailable'}</p>
      </div>
    )
  }

  if (isOwner) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <p className="text-slate-400">You are hosting this auction.</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Place a Bid</h3>
        {isTopBidder && (
          <span className="text-xs bg-green-700 text-green-100 px-2 py-1 rounded">You're winning! 🏆</span>
        )}
      </div>

      {/* Current bid summary */}
      <div className="bg-slate-700 rounded p-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Current bid</span>
          <span className="text-amber-500 font-bold">{auction.current_bid.toLocaleString()} tokens</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Minimum bid</span>
          <span className="text-white">{minBid.toLocaleString()} tokens</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Increment</span>
          <span className="text-white">+{increment} tokens</span>
        </div>
        {tokens && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Your balance</span>
            <span className={tokens.balance < minBid ? 'text-red-400' : 'text-white'}>
              {tokens.balance.toLocaleString()} tokens
            </span>
          </div>
        )}
      </div>

      {!auction.reserve_met && (
        <div className="flex items-start gap-2 bg-slate-700/50 rounded p-3">
          <Info size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-400">Reserve price not yet met. Item won't sell below reserve.</p>
        </div>
      )}

      {/* Proxy bid toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setUseProxy(false)}
          className={`flex-1 text-sm py-2 rounded transition ${
            !useProxy ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          <Gavel size={14} className="inline mr-1" />
          Standard
        </button>
        <button
          type="button"
          onClick={() => setUseProxy(true)}
          className={`flex-1 text-sm py-2 rounded transition ${
            useProxy ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          <Zap size={14} className="inline mr-1" />
          Proxy Max
        </button>
      </div>

      <form onSubmit={handleBid} className="space-y-3">
        {!useProxy ? (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Bid Amount (min {minBid} tokens)</label>
            <input
              type="number"
              min={minBid}
              step={increment}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`${minBid}`}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              required
            />
          </div>
        ) : (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Maximum You'll Pay (min {minBid} tokens)
            </label>
            <input
              type="number"
              min={minBid}
              step={increment}
              value={proxyMax}
              onChange={(e) => setProxyMax(e.target.value)}
              placeholder={`e.g. ${minBid * 2}`}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              We'll auto-bid up to your max. Others won't see your max.
            </p>
          </div>
        )}

        {message && (
          <p
            className={`text-sm px-3 py-2 rounded ${
              message.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || (tokens?.balance ?? 0) < minBid}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded transition"
        >
          {loading ? 'Placing Bid...' : useProxy ? '⚡ Set Proxy Bid' : '🔨 Place Bid'}
        </button>
      </form>
    </div>
  )
}
