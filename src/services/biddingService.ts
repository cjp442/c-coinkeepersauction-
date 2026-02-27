import { Bid } from '../types'
import {
  getAuction,
  getAuctionBids,
  addHistoryEntry,
  notifyBidListeners,
  _auctions,
  _bids,
} from './auctionService'

// Minimum bid increment table (token amount → increment)
const INCREMENT_TABLE: [number, number][] = [
  [0, 5],
  [100, 10],
  [500, 25],
  [1000, 50],
  [5000, 100],
  [10000, 250],
]

export function getMinimumIncrement(currentBid: number): number {
  let increment = 5
  for (const [threshold, inc] of INCREMENT_TABLE) {
    if (currentBid >= threshold) increment = inc
  }
  return increment
}

export function getMinimumBid(auctionId: string): number {
  const auction = getAuction(auctionId)
  if (!auction) return 0
  if (auction.bid_count === 0) return auction.starting_bid
  return auction.current_bid + getMinimumIncrement(auction.current_bid)
}

// ---------------------------------------------------------------------------
// Place a regular bid
// ---------------------------------------------------------------------------

export interface PlaceBidResult {
  success: boolean
  error?: string
  bid?: Bid
  newCurrentBid?: number
}

export function placeBid(
  auctionId: string,
  bidderId: string,
  bidderName: string,
  amount: number,
): PlaceBidResult {
  const auction = getAuction(auctionId)
  if (!auction) return { success: false, error: 'Auction not found' }
  if (auction.status !== 'active') return { success: false, error: 'Auction is not active' }
  if (auction.highest_bidder_id === bidderId)
    return { success: false, error: 'You are already the highest bidder' }

  const minBid = getMinimumBid(auctionId)
  if (amount < minBid) {
    return {
      success: false,
      error: `Bid must be at least ${minBid} tokens (current: ${auction.current_bid} + ${getMinimumIncrement(auction.current_bid)} increment)`,
    }
  }

  // Check if a proxy bid beats this
  const winningBid = resolveProxyBid(auctionId, bidderId, bidderName, amount)
  return winningBid
}

// ---------------------------------------------------------------------------
// Place a proxy / max bid
// ---------------------------------------------------------------------------

export function placeProxyBid(
  auctionId: string,
  bidderId: string,
  bidderName: string,
  maxAmount: number,
): PlaceBidResult {
  const auction = getAuction(auctionId)
  if (!auction) return { success: false, error: 'Auction not found' }
  if (auction.status !== 'active') return { success: false, error: 'Auction is not active' }

  const minBid = getMinimumBid(auctionId)
  if (maxAmount < minBid) {
    return {
      success: false,
      error: `Proxy max must be at least ${minBid} tokens`,
    }
  }

  // Place the proxy bid at the current minimum to get on the board
  return resolveProxyBid(auctionId, bidderId, bidderName, maxAmount, maxAmount)
}

// ---------------------------------------------------------------------------
// Snipe protection – extend auction if bid placed in final seconds
// ---------------------------------------------------------------------------

function applySnipeProtection(auctionId: string): void {
  const idx = _auctions.findIndex((a) => a.id === auctionId)
  if (idx === -1) return
  const auction = _auctions[idx]
  if (auction.status !== 'active') return

  const now = new Date()
  const ends = new Date(auction.ends_at)
  const remainingMs = ends.getTime() - now.getTime()
  const thresholdMs = auction.snipe_protection_minutes * 60 * 1000

  if (remainingMs > 0 && remainingMs <= thresholdMs) {
    const newEndsAt = new Date(now.getTime() + thresholdMs).toISOString()
    _auctions[idx] = { ...auction, ends_at: newEndsAt }
    addHistoryEntry(auctionId, {
      event_type: 'extended',
      description: `Auction extended by ${auction.snipe_protection_minutes} minute(s) due to snipe protection`,
    })
  }
}

// ---------------------------------------------------------------------------
// Internal: resolve a bid against any outstanding proxy bids
// ---------------------------------------------------------------------------

function generateId(): string {
  return crypto.randomUUID()
}

function resolveProxyBid(
  auctionId: string,
  newBidderId: string,
  newBidderName: string,
  newAmount: number,
  newProxyMax?: number,
): PlaceBidResult {
  const auctionIdx = _auctions.findIndex((a) => a.id === auctionId)
  if (auctionIdx === -1) return { success: false, error: 'Auction not found' }

  const auction = _auctions[auctionIdx]

  // Find the existing highest bidder's proxy bid (if any)
  const existingProxyBids = _bids.filter(
    (b) => b.auction_id === auctionId && b.is_proxy && b.bidder_id === auction.highest_bidder_id,
  )
  const bestExistingProxy =
    existingProxyBids.length > 0
      ? existingProxyBids.reduce((best, b) => ((b.proxy_max ?? 0) > (best.proxy_max ?? 0) ? b : best))
      : null

  let winningBid: Bid
  let newCurrentBid = newAmount

  if (bestExistingProxy && bestExistingProxy.proxy_max !== undefined) {
    const existingMax = bestExistingProxy.proxy_max
    const increment = getMinimumIncrement(auction.current_bid)

    if (existingMax >= newAmount) {
      // Existing proxy beats or ties – auto-increment existing proxy to beat
      newCurrentBid = Math.min(existingMax, newAmount + increment)
      const autoBid: Bid = {
        id: generateId(),
        auction_id: auctionId,
        bidder_id: auction.highest_bidder_id!,
        bidder_name: auction.highest_bidder_name!,
        amount: newCurrentBid,
        is_proxy: true,
        proxy_max: existingMax,
        created_at: new Date().toISOString(),
      }
      _bids.push(autoBid)
      addHistoryEntry(auctionId, {
        event_type: 'bid',
        actor_id: autoBid.bidder_id,
        actor_name: autoBid.bidder_name,
        amount: autoBid.amount,
        description: `${autoBid.bidder_name} auto-bid ${autoBid.amount} tokens (proxy)`,
      })
      notifyBidListeners(auctionId, autoBid)

      // Original bid fails
      return {
        success: false,
        error: `You were outbid by proxy. Minimum bid is now ${newCurrentBid + getMinimumIncrement(newCurrentBid)} tokens`,
      }
    } else {
      // New bid / proxy beats existing proxy
      newCurrentBid = Math.min(newAmount, existingMax + increment)
    }
  }

  // Place the winning bid
  winningBid = {
    id: generateId(),
    auction_id: auctionId,
    bidder_id: newBidderId,
    bidder_name: newBidderName,
    amount: newCurrentBid,
    is_proxy: newProxyMax !== undefined,
    proxy_max: newProxyMax,
    created_at: new Date().toISOString(),
  }
  _bids.push(winningBid)

  const reserveMet = auction.reserve_price === undefined || newCurrentBid >= auction.reserve_price

  _auctions[auctionIdx] = {
    ...auction,
    current_bid: newCurrentBid,
    highest_bidder_id: newBidderId,
    highest_bidder_name: newBidderName,
    bid_count: auction.bid_count + 1,
    reserve_met: reserveMet,
  }

  addHistoryEntry(auctionId, {
    event_type: 'bid',
    actor_id: newBidderId,
    actor_name: newBidderName,
    amount: newCurrentBid,
    description: `${newBidderName} placed a bid of ${newCurrentBid} tokens${newProxyMax ? ` (proxy max: ${newProxyMax})` : ''}`,
  })

  if (reserveMet && !auction.reserve_met) {
    addHistoryEntry(auctionId, {
      event_type: 'reserve_met',
      description: 'Reserve price has been met',
    })
  }

  applySnipeProtection(auctionId)
  notifyBidListeners(auctionId, winningBid)

  return { success: true, bid: winningBid, newCurrentBid }
}

export { getAuctionBids }
