// src/services/liveAuctionService.ts
// Live auction lifecycle management - auctions ONLY valid during active streams

import { LiveAuction, LiveBid, StreamSession, AuctionItem, FlashDrop, SellerRating } from '../types'

const STORAGE_KEYS = {
  SESSIONS: 'live_stream_sessions',
  AUCTIONS: 'live_auctions',
  BIDS: 'live_bids',
  ITEMS: 'auction_items',
  FLASH_DROPS: 'flash_drops',
  RATINGS: 'seller_ratings',
  NOTIFY: 'stream_notify_requests',
}

const BID_INCREMENT = 5 // minimum auto-increment in tokens

// ─── Session helpers ──────────────────────────────────────────────────────────

export function getStreamSessions(): StreamSession[] {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS)
  return stored ? (JSON.parse(stored) as StreamSession[]) : []
}

export function getActiveSession(hostId: string): StreamSession | null {
  return getStreamSessions().find(s => s.host_id === hostId && s.status === 'live') ?? null
}

export function startStream(hostId: string, hostName: string, title: string): StreamSession {
  const session: StreamSession = {
    id: `sess_${Date.now()}`,
    host_id: hostId,
    host_name: hostName,
    title,
    status: 'live',
    viewer_count: 0,
    started_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }
  const sessions = getStreamSessions()
  sessions.push(session)
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
  return session
}

export function endStream(sessionId: string): void {
  const sessions = getStreamSessions().map(s =>
    s.id === sessionId ? { ...s, status: 'ended' as const, ended_at: new Date().toISOString() } : s,
  )
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))

  // KEY RULE: end all active auctions when stream ends
  const auctions = getLiveAuctions().map(a =>
    a.stream_session_id === sessionId && a.status === 'active'
      ? {
          ...a,
          status: 'ended' as const,
          ended_at: new Date().toISOString(),
          final_price: a.current_bid > 0 ? a.current_bid : undefined,
          winner_id: a.current_bidder_id,
          winner_name: a.current_bidder_name,
        }
      : a,
  )
  localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions))
}

export function incrementViewerCount(sessionId: string): void {
  const sessions = getStreamSessions().map(s =>
    s.id === sessionId ? { ...s, viewer_count: s.viewer_count + 1 } : s,
  )
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
}

// ─── Auction item helpers ─────────────────────────────────────────────────────

export function getAuctionItems(hostId: string): AuctionItem[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ITEMS)
  const items: AuctionItem[] = stored ? (JSON.parse(stored) as AuctionItem[]) : []
  return items.filter(i => i.host_id === hostId)
}

export function createAuctionItem(
  hostId: string,
  title: string,
  description: string,
  startingPrice: number,
  options?: { reservePrice?: number; isFlashDrop?: boolean; flashQuantity?: number; imageUrl?: string },
): AuctionItem {
  const item: AuctionItem = {
    id: `item_${Date.now()}`,
    host_id: hostId,
    title,
    description,
    image_url: options?.imageUrl,
    starting_price: startingPrice,
    reserve_price: options?.reservePrice,
    is_flash_drop: options?.isFlashDrop ?? false,
    flash_quantity: options?.flashQuantity,
    flash_remaining: options?.flashQuantity,
    created_at: new Date().toISOString(),
  }
  const stored = localStorage.getItem(STORAGE_KEYS.ITEMS)
  const items: AuctionItem[] = stored ? (JSON.parse(stored) as AuctionItem[]) : []
  items.push(item)
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items))
  return item
}

// ─── Live auction helpers ─────────────────────────────────────────────────────

export function getLiveAuctions(): LiveAuction[] {
  const stored = localStorage.getItem(STORAGE_KEYS.AUCTIONS)
  return stored ? (JSON.parse(stored) as LiveAuction[]) : []
}

export function getAuctionsBySession(sessionId: string): LiveAuction[] {
  return getLiveAuctions().filter(a => a.stream_session_id === sessionId)
}

export function getActiveAuction(sessionId: string): LiveAuction | null {
  return getAuctionsBySession(sessionId).find(a => a.status === 'active') ?? null
}

/** Host initiates an auction during a live stream. Fails if no active stream. */
export function startAuction(
  sessionId: string,
  hostId: string,
  item: AuctionItem,
): LiveAuction {
  const session = getStreamSessions().find(s => s.id === sessionId)
  if (!session || session.status !== 'live') {
    throw new Error('Cannot start auction: no active stream session')
  }

  const existing = getActiveAuction(sessionId)
  if (existing) {
    throw new Error('An auction is already active in this stream')
  }

  const auction: LiveAuction = {
    id: `auction_${Date.now()}`,
    stream_session_id: sessionId,
    auction_item_id: item.id,
    item_title: item.title,
    item_description: item.description,
    item_image_url: item.image_url,
    host_id: hostId,
    status: 'active',
    starting_price: item.starting_price,
    current_bid: 0,
    bid_count: 0,
    view_count: 0,
    started_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }

  const auctions = getLiveAuctions()
  auctions.push(auction)
  localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions))
  return auction
}

/** Host manually closes an auction. */
export function endAuction(auctionId: string): LiveAuction {
  const auctions = getLiveAuctions()
  const idx = auctions.findIndex(a => a.id === auctionId)
  if (idx === -1) throw new Error('Auction not found')
  const auction = auctions[idx]
  if (auction.status !== 'active') throw new Error('Auction is not active')

  const updated: LiveAuction = {
    ...auction,
    status: auction.current_bid > 0 ? 'sold' : 'ended',
    ended_at: new Date().toISOString(),
    final_price: auction.current_bid > 0 ? auction.current_bid : undefined,
    winner_id: auction.current_bidder_id,
    winner_name: auction.current_bidder_name,
  }
  auctions[idx] = updated
  localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions))
  return updated
}

/** Returns minimum valid next bid for an auction. */
export function getMinBid(auction: LiveAuction): number {
  if (auction.current_bid === 0) return auction.starting_price
  return auction.current_bid + BID_INCREMENT
}

// ─── Bid helpers ──────────────────────────────────────────────────────────────

export function getBidsByAuction(auctionId: string): LiveBid[] {
  const stored = localStorage.getItem(STORAGE_KEYS.BIDS)
  const bids: LiveBid[] = stored ? (JSON.parse(stored) as LiveBid[]) : []
  return bids.filter(b => b.auction_id === auctionId).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

/**
 * Place a bid on an active auction.
 * Validates that the auction is active and the amount meets the minimum.
 * Supports proxy bidding: if maxBid is provided, future proxy bids auto-increment.
 */
export function placeBid(
  auctionId: string,
  bidderId: string,
  bidderName: string,
  amount: number,
  maxBid?: number,
): LiveBid {
  const auctions = getLiveAuctions()
  const auctionIdx = auctions.findIndex(a => a.id === auctionId)
  if (auctionIdx === -1) throw new Error('Auction not found')

  const auction = auctions[auctionIdx]

  // KEY RULE: bids only valid during active stream
  const session = getStreamSessions().find(s => s.id === auction.stream_session_id)
  if (!session || session.status !== 'live') {
    throw new Error('Bids are only valid during an active live stream')
  }
  if (auction.status !== 'active') {
    throw new Error('Auction is not active')
  }

  const minBid = getMinBid(auction)
  if (amount < minBid) {
    throw new Error(`Bid must be at least ${minBid} tokens`)
  }

  const bid: LiveBid = {
    id: `bid_${crypto.randomUUID()}`,
    auction_id: auctionId,
    bidder_id: bidderId,
    bidder_name: bidderName,
    amount,
    max_bid: maxBid,
    is_proxy: false,
    created_at: new Date().toISOString(),
  }

  const stored = localStorage.getItem(STORAGE_KEYS.BIDS)
  const allBids: LiveBid[] = stored ? (JSON.parse(stored) as LiveBid[]) : []

  // Proxy bidding: check if previous highest bidder has a max_bid that auto-tops this bid
  const prevHighestBid = allBids
    .filter(b => b.auction_id === auctionId && b.bidder_id === auction.current_bidder_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  let winningBid = bid
  let winningAmount = amount

  if (
    prevHighestBid?.max_bid &&
    prevHighestBid.max_bid > amount &&
    prevHighestBid.bidder_id !== bidderId
  ) {
    // Previous bidder's proxy outbids the new bid
    const proxyAmount = Math.min(prevHighestBid.max_bid, amount + BID_INCREMENT)
    const proxyBid: LiveBid = {
      id: `bid_${crypto.randomUUID()}`,
      auction_id: auctionId,
      bidder_id: prevHighestBid.bidder_id,
      bidder_name: prevHighestBid.bidder_name,
      amount: proxyAmount,
      max_bid: prevHighestBid.max_bid,
      is_proxy: true,
      created_at: new Date(Date.now() + 1).toISOString(),
    }
    allBids.push(bid)
    allBids.push(proxyBid)
    winningBid = proxyBid
    winningAmount = proxyAmount
  } else {
    allBids.push(bid)
  }

  localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(allBids))

  // Update auction state
  const updatedAuction: LiveAuction = {
    ...auction,
    current_bid: winningAmount,
    current_bidder_id: winningBid.bidder_id,
    current_bidder_name: winningBid.bidder_name,
    bid_count: auction.bid_count + (winningBid.is_proxy ? 2 : 1),
  }
  auctions[auctionIdx] = updatedAuction
  localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions))

  return winningBid
}

// ─── Flash drops ─────────────────────────────────────────────────────────────

export function createFlashDrop(
  sessionId: string,
  itemTitle: string,
  price: number,
  quantity: number,
  durationSeconds: number,
): FlashDrop {
  const drop: FlashDrop = {
    id: `flash_${Date.now()}`,
    stream_session_id: sessionId,
    item_title: itemTitle,
    price,
    quantity,
    remaining: quantity,
    expires_at: new Date(Date.now() + durationSeconds * 1000).toISOString(),
    created_at: new Date().toISOString(),
  }
  const stored = localStorage.getItem(STORAGE_KEYS.FLASH_DROPS)
  const drops: FlashDrop[] = stored ? (JSON.parse(stored) as FlashDrop[]) : []
  drops.push(drop)
  localStorage.setItem(STORAGE_KEYS.FLASH_DROPS, JSON.stringify(drops))
  return drop
}

export function claimFlashDrop(dropId: string): FlashDrop {
  const stored = localStorage.getItem(STORAGE_KEYS.FLASH_DROPS)
  const drops: FlashDrop[] = stored ? (JSON.parse(stored) as FlashDrop[]) : []
  const idx = drops.findIndex(d => d.id === dropId)
  if (idx === -1) throw new Error('Flash drop not found')
  const drop = drops[idx]
  if (drop.remaining <= 0) throw new Error('Flash drop sold out')
  if (new Date(drop.expires_at) < new Date()) throw new Error('Flash drop has expired')
  drops[idx] = { ...drop, remaining: drop.remaining - 1 }
  localStorage.setItem(STORAGE_KEYS.FLASH_DROPS, JSON.stringify(drops))
  return drops[idx]
}

export function getActiveFlashDrops(sessionId: string): FlashDrop[] {
  const stored = localStorage.getItem(STORAGE_KEYS.FLASH_DROPS)
  const drops: FlashDrop[] = stored ? (JSON.parse(stored) as FlashDrop[]) : []
  const now = new Date()
  return drops.filter(
    d =>
      d.stream_session_id === sessionId &&
      d.remaining > 0 &&
      new Date(d.expires_at) > now,
  )
}

// ─── Seller ratings ───────────────────────────────────────────────────────────

export function getSellerRatings(sellerId: string): SellerRating[] {
  const stored = localStorage.getItem(STORAGE_KEYS.RATINGS)
  const ratings: SellerRating[] = stored ? (JSON.parse(stored) as SellerRating[]) : []
  return ratings.filter(r => r.seller_id === sellerId)
}

export function submitSellerRating(
  sellerId: string,
  reviewerId: string,
  reviewerName: string,
  auctionId: string,
  rating: number,
  comment: string,
): SellerRating {
  const newRating: SellerRating = {
    id: `rating_${Date.now()}`,
    seller_id: sellerId,
    reviewer_id: reviewerId,
    reviewer_name: reviewerName,
    rating: Math.min(5, Math.max(1, rating)),
    comment,
    auction_id: auctionId,
    created_at: new Date().toISOString(),
  }
  const stored = localStorage.getItem(STORAGE_KEYS.RATINGS)
  const ratings: SellerRating[] = stored ? (JSON.parse(stored) as SellerRating[]) : []
  ratings.push(newRating)
  localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings))
  return newRating
}

export function getAverageRating(sellerId: string): number {
  const ratings = getSellerRatings(sellerId)
  if (ratings.length === 0) return 0
  return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
}

// ─── Stream schedule / notify ─────────────────────────────────────────────────

export function registerStreamNotify(userId: string, hostId: string): void {
  const stored = localStorage.getItem(STORAGE_KEYS.NOTIFY)
  const entries: { userId: string; hostId: string }[] = stored
    ? (JSON.parse(stored) as { userId: string; hostId: string }[])
    : []
  const alreadyRegistered = entries.some(e => e.userId === userId && e.hostId === hostId)
  if (!alreadyRegistered) {
    entries.push({ userId, hostId })
    localStorage.setItem(STORAGE_KEYS.NOTIFY, JSON.stringify(entries))
  }
}

export function isNotifyRegistered(userId: string, hostId: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEYS.NOTIFY)
  const entries: { userId: string; hostId: string }[] = stored
    ? (JSON.parse(stored) as { userId: string; hostId: string }[])
    : []
  return entries.some(e => e.userId === userId && e.hostId === hostId)
}

export { BID_INCREMENT }
