// src/services/streamBiddingService.ts
// Real-time bid update pub/sub system (simulates WebSocket with in-process event bus)

import { LiveAuction, LiveBid } from '../types'

export type BidEventType =
  | 'new_bid'
  | 'auction_started'
  | 'auction_ended'
  | 'auction_sold'
  | 'outbid'
  | 'won'
  | 'flash_drop'
  | 'viewer_joined'

export interface BidEvent {
  type: BidEventType
  auctionId?: string
  sessionId?: string
  auction?: LiveAuction
  bid?: LiveBid
  message?: string
  timestamp: string
}

export type BidEventHandler = (event: BidEvent) => void

// ─── Simple in-process event bus (replaces WebSocket for now) ────────────────

const handlers: Map<string, Set<BidEventHandler>> = new Map()

/** Subscribe to events for a specific auction or session. */
export function subscribe(channelId: string, handler: BidEventHandler): () => void {
  if (!handlers.has(channelId)) {
    handlers.set(channelId, new Set())
  }
  handlers.get(channelId)!.add(handler)

  // Return unsubscribe function
  return () => {
    handlers.get(channelId)?.delete(handler)
  }
}

/** Publish an event to all subscribers of a channel. */
export function publish(channelId: string, event: BidEvent): void {
  handlers.get(channelId)?.forEach(handler => {
    try {
      handler(event)
    } catch (err) {
      console.error('BidEvent handler error:', err)
    }
  })
}

/** Emit a bid-placed event to auction channel subscribers. */
export function emitNewBid(auction: LiveAuction, bid: LiveBid, previousBidderId?: string): void {
  const event: BidEvent = {
    type: 'new_bid',
    auctionId: auction.id,
    sessionId: auction.stream_session_id,
    auction,
    bid,
    timestamp: new Date().toISOString(),
  }
  publish(auction.id, event)
  publish(auction.stream_session_id, event)

  // Notify the outbid user
  if (previousBidderId && previousBidderId !== bid.bidder_id) {
    const outbidEvent: BidEvent = {
      type: 'outbid',
      auctionId: auction.id,
      sessionId: auction.stream_session_id,
      auction,
      bid,
      message: `You were outbid on "${auction.item_title}" — new bid: ${bid.amount} tokens`,
      timestamp: new Date().toISOString(),
    }
    publish(`user_${previousBidderId}`, outbidEvent)
  }
}

/** Emit auction-started event. */
export function emitAuctionStarted(auction: LiveAuction): void {
  const event: BidEvent = {
    type: 'auction_started',
    auctionId: auction.id,
    sessionId: auction.stream_session_id,
    auction,
    message: `🔨 Auction started: "${auction.item_title}" — starting at ${auction.starting_price} tokens`,
    timestamp: new Date().toISOString(),
  }
  publish(auction.stream_session_id, event)
}

/** Emit auction-ended/sold event and notify the winner. */
export function emitAuctionEnded(auction: LiveAuction): void {
  const isSold = auction.status === 'sold'
  const event: BidEvent = {
    type: isSold ? 'auction_sold' : 'auction_ended',
    auctionId: auction.id,
    sessionId: auction.stream_session_id,
    auction,
    message: isSold
      ? `🏆 Sold to ${auction.winner_name} for ${auction.final_price} tokens!`
      : `⏹ Auction ended: "${auction.item_title}" — no bids`,
    timestamp: new Date().toISOString(),
  }
  publish(auction.id, event)
  publish(auction.stream_session_id, event)

  if (isSold && auction.winner_id) {
    const wonEvent: BidEvent = {
      type: 'won',
      auctionId: auction.id,
      sessionId: auction.stream_session_id,
      auction,
      message: `🎉 You won "${auction.item_title}" for ${auction.final_price} tokens!`,
      timestamp: new Date().toISOString(),
    }
    publish(`user_${auction.winner_id}`, wonEvent)
  }
}

/** Emit a flash-drop notification to a stream session channel. */
export function emitFlashDrop(sessionId: string, itemTitle: string, price: number, quantity: number): void {
  const event: BidEvent = {
    type: 'flash_drop',
    sessionId,
    message: `⚡ FLASH DROP: ${itemTitle} — ${price} tokens × ${quantity} available!`,
    timestamp: new Date().toISOString(),
  }
  publish(sessionId, event)
}

/** Emit viewer-joined event. */
export function emitViewerJoined(sessionId: string): void {
  const event: BidEvent = {
    type: 'viewer_joined',
    sessionId,
    timestamp: new Date().toISOString(),
  }
  publish(sessionId, event)
}
