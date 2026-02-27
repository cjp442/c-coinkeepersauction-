import { Auction, Bid, AuctionHistoryEntry, AuctionCategory } from '../types'

// ---------------------------------------------------------------------------
// In-memory store (mock backend – swap for Supabase calls when ready)
// ---------------------------------------------------------------------------

function generateId(): string {
  return crypto.randomUUID()
}

const now = new Date()

const MOCK_AUCTIONS: Auction[] = [
  {
    id: 'a1',
    host_id: 'h1',
    host_name: 'CoinMaster',
    title: 'Morgan Silver Dollar 1921',
    description: 'Uncirculated Morgan Silver Dollar from 1921. Grade: MS-65.',
    image_url: undefined,
    category: 'coins',
    starting_bid: 100,
    current_bid: 125,
    reserve_price: 200,
    reserve_met: false,
    highest_bidder_id: 'u2',
    highest_bidder_name: 'silverHunter',
    bid_count: 4,
    view_count: 38,
    status: 'active',
    is_featured: true,
    snipe_protection_minutes: 2,
    created_at: new Date(now.getTime() - 86400000).toISOString(),
    starts_at: new Date(now.getTime() - 3600000).toISOString(),
    ends_at: new Date(now.getTime() + 3600000 * 2).toISOString(),
  },
  {
    id: 'a2',
    host_id: 'h1',
    host_name: 'CoinMaster',
    title: 'Gold Bar 1oz – PAMP Suisse',
    description: '1 troy ounce .9999 fine gold bar with assay card.',
    image_url: undefined,
    category: 'bullion',
    starting_bid: 2000,
    current_bid: 2500,
    reserve_price: 2400,
    reserve_met: true,
    highest_bidder_id: 'u3',
    highest_bidder_name: 'goldBull',
    bid_count: 9,
    view_count: 120,
    status: 'active',
    is_featured: true,
    snipe_protection_minutes: 2,
    created_at: new Date(now.getTime() - 86400000).toISOString(),
    starts_at: new Date(now.getTime() - 7200000).toISOString(),
    ends_at: new Date(now.getTime() + 1800000).toISOString(),
  },
  {
    id: 'a3',
    host_id: 'h2',
    host_name: 'BullionKing',
    title: 'Silver Bullion 10oz Set',
    description: 'A set of ten 1oz .999 silver rounds from various mints.',
    image_url: undefined,
    category: 'bullion',
    starting_bid: 800,
    current_bid: 850,
    reserve_price: undefined,
    reserve_met: true,
    highest_bidder_id: 'u4',
    highest_bidder_name: 'stackAttack',
    bid_count: 3,
    view_count: 55,
    status: 'active',
    is_featured: false,
    snipe_protection_minutes: 2,
    created_at: new Date(now.getTime() - 3600000).toISOString(),
    starts_at: new Date(now.getTime() + 1800000).toISOString(),
    ends_at: new Date(now.getTime() + 7200000).toISOString(),
  },
  {
    id: 'a4',
    host_id: 'h3',
    host_name: 'RareFinds',
    title: 'Walking Liberty Half Dollar 1916-D',
    description: 'Key-date Walking Liberty. Grade: VF-20.',
    image_url: undefined,
    category: 'coins',
    starting_bid: 500,
    current_bid: 500,
    reserve_price: 450,
    reserve_met: true,
    highest_bidder_id: undefined,
    highest_bidder_name: undefined,
    bid_count: 0,
    view_count: 22,
    status: 'pending',
    is_featured: false,
    snipe_protection_minutes: 5,
    created_at: new Date(now.getTime() - 1800000).toISOString(),
    starts_at: new Date(now.getTime() + 86400000).toISOString(),
    ends_at: new Date(now.getTime() + 86400000 * 2).toISOString(),
  },
  {
    id: 'a5',
    host_id: 'h2',
    host_name: 'BullionKing',
    title: 'Platinum Eagle 1oz 2020',
    description: 'American Platinum Eagle 1oz proof coin in mint packaging.',
    image_url: undefined,
    category: 'bullion',
    starting_bid: 1200,
    current_bid: 1350,
    reserve_price: 1300,
    reserve_met: true,
    highest_bidder_id: 'u1',
    highest_bidder_name: 'platinumPete',
    bid_count: 6,
    view_count: 67,
    status: 'ended',
    is_featured: false,
    snipe_protection_minutes: 2,
    created_at: new Date(now.getTime() - 172800000).toISOString(),
    starts_at: new Date(now.getTime() - 86400000).toISOString(),
    ends_at: new Date(now.getTime() - 3600000).toISOString(),
  },
]

const MOCK_BIDS: Bid[] = [
  { id: 'b1', auction_id: 'a1', bidder_id: 'u2', bidder_name: 'silverHunter', amount: 125, is_proxy: false, created_at: new Date(now.getTime() - 600000).toISOString() },
  { id: 'b2', auction_id: 'a1', bidder_id: 'u5', bidder_name: 'coinCollector', amount: 115, is_proxy: false, created_at: new Date(now.getTime() - 900000).toISOString() },
  { id: 'b3', auction_id: 'a1', bidder_id: 'u2', bidder_name: 'silverHunter', amount: 110, is_proxy: false, created_at: new Date(now.getTime() - 1200000).toISOString() },
  { id: 'b4', auction_id: 'a1', bidder_id: 'u6', bidder_name: 'mintFan', amount: 105, is_proxy: false, created_at: new Date(now.getTime() - 1800000).toISOString() },
  { id: 'b5', auction_id: 'a2', bidder_id: 'u3', bidder_name: 'goldBull', amount: 2500, is_proxy: true, created_at: new Date(now.getTime() - 300000).toISOString() },
  { id: 'b6', auction_id: 'a2', bidder_id: 'u7', bidder_name: 'bullionBob', amount: 2450, is_proxy: false, created_at: new Date(now.getTime() - 600000).toISOString() },
]

const MOCK_HISTORY: AuctionHistoryEntry[] = [
  { id: 'h1', auction_id: 'a1', event_type: 'started', description: 'Auction started', created_at: new Date(now.getTime() - 3600000).toISOString() },
  { id: 'h2', auction_id: 'a1', event_type: 'bid', actor_id: 'u6', actor_name: 'mintFan', amount: 105, description: 'mintFan placed a bid of 105 tokens', created_at: new Date(now.getTime() - 1800000).toISOString() },
  { id: 'h3', auction_id: 'a1', event_type: 'bid', actor_id: 'u2', actor_name: 'silverHunter', amount: 110, description: 'silverHunter placed a bid of 110 tokens', created_at: new Date(now.getTime() - 1200000).toISOString() },
  { id: 'h4', auction_id: 'a1', event_type: 'bid', actor_id: 'u5', actor_name: 'coinCollector', amount: 115, description: 'coinCollector placed a bid of 115 tokens', created_at: new Date(now.getTime() - 900000).toISOString() },
  { id: 'h5', auction_id: 'a1', event_type: 'bid', actor_id: 'u2', actor_name: 'silverHunter', amount: 125, description: 'silverHunter placed a bid of 125 tokens', created_at: new Date(now.getTime() - 600000).toISOString() },
]

// In-memory state
let auctions: Auction[] = [...MOCK_AUCTIONS]
let bids: Bid[] = [...MOCK_BIDS]
let history: AuctionHistoryEntry[] = [...MOCK_HISTORY]

// Callbacks for real-time updates (simulating WebSocket)
type AuctionListener = (auction: Auction) => void
type BidListener = (bid: Bid) => void
const auctionListeners: Map<string, AuctionListener[]> = new Map()
const bidListeners: Map<string, BidListener[]> = new Map()

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

export interface AuctionFilters {
  status?: Auction['status'] | 'all'
  category?: AuctionCategory | 'all'
  search?: string
}

export function refreshAllAuctionStatuses(): void {
  auctions = auctions.map(refreshAuctionStatus)
}

export function getAuctions(filters: AuctionFilters = {}): Auction[] {
  let result = [...auctions]

  if (filters.status && filters.status !== 'all') {
    result = result.filter((a) => a.status === filters.status)
  }
  if (filters.category && filters.category !== 'all') {
    result = result.filter((a) => a.category === filters.category)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.host_name.toLowerCase().includes(q),
    )
  }
  return result.sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime())
}

export function getAuction(id: string): Auction | undefined {
  const a = auctions.find((a) => a.id === id)
  if (!a) return undefined
  const refreshed = refreshAuctionStatus(a)
  const idx = auctions.findIndex((x) => x.id === id)
  if (idx !== -1) auctions[idx] = refreshed
  return refreshed
}

export function getAuctionBids(auctionId: string): Bid[] {
  return bids.filter((b) => b.auction_id === auctionId).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

export function getAuctionHistory(auctionId: string): AuctionHistoryEntry[] {
  return history
    .filter((h) => h.auction_id === auctionId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// ---------------------------------------------------------------------------
// Auction lifecycle
// ---------------------------------------------------------------------------

export interface CreateAuctionInput {
  title: string
  description: string
  category: AuctionCategory
  starting_bid: number
  reserve_price?: number
  snipe_protection_minutes?: number
  starts_at: string
  ends_at: string
  host_id: string
  host_name: string
  image_url?: string
}

export function createAuction(input: CreateAuctionInput): Auction {
  const auction: Auction = {
    id: generateId(),
    host_id: input.host_id,
    host_name: input.host_name,
    title: input.title,
    description: input.description,
    image_url: input.image_url,
    category: input.category,
    starting_bid: input.starting_bid,
    current_bid: input.starting_bid,
    reserve_price: input.reserve_price,
    reserve_met: input.reserve_price === undefined,
    highest_bidder_id: undefined,
    highest_bidder_name: undefined,
    bid_count: 0,
    view_count: 0,
    status: 'pending',
    is_featured: false,
    snipe_protection_minutes: input.snipe_protection_minutes ?? 2,
    created_at: new Date().toISOString(),
    starts_at: input.starts_at,
    ends_at: input.ends_at,
  }
  auctions.push(auction)
  addHistoryEntry(auction.id, {
    event_type: 'started',
    description: 'Auction created and scheduled',
  })
  return auction
}

export function cancelAuction(auctionId: string, actorId: string): boolean {
  const idx = auctions.findIndex((a) => a.id === auctionId)
  if (idx === -1) return false
  const auction = auctions[idx]
  if (auction.status === 'ended' || auction.status === 'sold') return false
  auctions[idx] = { ...auction, status: 'cancelled' }
  addHistoryEntry(auctionId, {
    event_type: 'cancelled',
    actor_id: actorId,
    description: 'Auction cancelled by host',
  })
  notifyAuctionListeners(auctions[idx])
  return true
}

export function incrementViewCount(auctionId: string): void {
  const idx = auctions.findIndex((a) => a.id === auctionId)
  if (idx !== -1) {
    auctions[idx] = { ...auctions[idx], view_count: auctions[idx].view_count + 1 }
  }
}

// ---------------------------------------------------------------------------
// Real-time subscriptions (simulated)
// ---------------------------------------------------------------------------

export function subscribeToAuction(auctionId: string, cb: AuctionListener): () => void {
  const list = auctionListeners.get(auctionId) ?? []
  list.push(cb)
  auctionListeners.set(auctionId, list)
  return () => {
    const updated = (auctionListeners.get(auctionId) ?? []).filter((l) => l !== cb)
    auctionListeners.set(auctionId, updated)
  }
}

export function subscribeToBids(auctionId: string, cb: BidListener): () => void {
  const list = bidListeners.get(auctionId) ?? []
  list.push(cb)
  bidListeners.set(auctionId, list)
  return () => {
    const updated = (bidListeners.get(auctionId) ?? []).filter((l) => l !== cb)
    bidListeners.set(auctionId, updated)
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function refreshAuctionStatus(auction: Auction): Auction {
  const now = new Date()
  const starts = new Date(auction.starts_at)
  const ends = new Date(auction.ends_at)
  if (auction.status === 'cancelled') return auction
  if (auction.status === 'pending' && now >= starts) {
    return { ...auction, status: 'active' }
  }
  if (auction.status === 'active' && now >= ends) {
    const newStatus = auction.reserve_met ? 'sold' : 'ended'
    return { ...auction, status: newStatus }
  }
  return auction
}

export function addHistoryEntry(
  auctionId: string,
  entry: Omit<AuctionHistoryEntry, 'id' | 'auction_id' | 'created_at'>,
): void {
  history.push({
    id: generateId(),
    auction_id: auctionId,
    created_at: new Date().toISOString(),
    ...entry,
  })
}

function notifyAuctionListeners(auction: Auction): void {
  const listeners = auctionListeners.get(auction.id) ?? []
  listeners.forEach((cb) => cb(auction))
}

export function notifyBidListeners(auctionId: string, bid: Bid): void {
  const listeners = bidListeners.get(auctionId) ?? []
  listeners.forEach((cb) => cb(bid))
}

export { auctions as _auctions, bids as _bids }
// src/services/auctionService.ts

interface Auction {
    id: string;
    title: string;
    description: string;
    startingBid: number;
    currentBid: number;
    bids: Bid[];
    status: 'active' | 'ended';
}

interface Bid {
    userId: string;
    amount: number;
    timestamp: Date;
}

class AuctionService {
    private auctions: Auction[] = [];

    createAuction(title: string, description: string, startingBid: number): Auction {
        const newAuction: Auction = {
            id: this.generateId(),
            title,
            description,
            startingBid,
            currentBid: startingBid,
            bids: [],
            status: 'active',
        };
        this.auctions.push(newAuction);
        return newAuction;
    }

    placeBid(auctionId: string, userId: string, bidAmount: number): string {
        const auction = this.auctions.find(auc => auc.id === auctionId);
        if (!auction || auction.status !== 'active') {
            throw new Error('Auction not found or has ended.');
        }
        if (bidAmount <= auction.currentBid) {
            throw new Error('Bid must be higher than current bid.');
        }

        auction.bids.push({ userId, amount: bidAmount, timestamp: new Date() });
        auction.currentBid = bidAmount;
        return 'Bid placed successfully';
    }

    updateAuctionStatus(auctionId: string, status: 'active' | 'ended'): string {
        const auction = this.auctions.find(auc => auc.id === auctionId);
        if (!auction) {
            throw new Error('Auction not found.');
        }
        auction.status = status;
        return 'Auction status updated successfully';
    }

    fetchAuctionHistory(auctionId: string): Bid[] {
        const auction = this.auctions.find(auc => auc.id === auctionId);
        if (!auction) {
            throw new Error('Auction not found.');
        }
        return auction.bids;
    }

    private generateId(): string {
        // Simple ID generation (for example purposes)
        return Math.random().toString(36).substr(2, 9);
    }
}

export const auctionService = new AuctionService();
