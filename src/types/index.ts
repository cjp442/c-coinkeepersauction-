export interface User {
  id: string
  email: string
  username: string
  role: 'user' | 'vip' | 'host' | 'admin'
  avatar_id?: string
  created_at: string
}

export interface Membership {
  id: string
  user_id: string
  tier: 'basic' | 'vip' | 'premium' | 'host' | 'admin'
  status: 'active' | 'expired' | 'cancelled'
  expires_at: string
  created_at: string
}

export interface Token {
  id: string
  user_id: string
  balance: number
  safe_balance: number
  created_at: string
  updated_at: string
}

export type AuctionCategory =
  | 'coins'
  | 'bullion'
  | 'collectibles'
  | 'jewelry'
  | 'art'
  | 'other'

export interface Auction {
  id: string
  host_id: string
  host_name: string
  title: string
  description: string
  image_url?: string
  category: AuctionCategory
  starting_bid: number
  current_bid: number
  reserve_price?: number
  reserve_met: boolean
  highest_bidder_id?: string
  highest_bidder_name?: string
  bid_count: number
  view_count: number
  status: 'pending' | 'active' | 'ended' | 'sold' | 'cancelled'
  is_featured: boolean
  snipe_protection_minutes: number
  created_at: string
  starts_at: string
  ends_at: string
}

export interface Bid {
  id: string
  auction_id: string
  bidder_id: string
  bidder_name: string
  amount: number
  is_proxy: boolean
  proxy_max?: number
  created_at: string
}

export interface ProxyBid {
  id: string
  auction_id: string
  bidder_id: string
  bidder_name: string
  max_amount: number
  created_at: string
}

export interface AuctionItem {
  id: string
  auction_id: string
  name: string
  description: string
  condition: string
  quantity: number
  image_url?: string
}

export interface AuctionHistoryEntry {
  id: string
  auction_id: string
  event_type: 'bid' | 'outbid' | 'reserve_met' | 'started' | 'ended' | 'cancelled' | 'extended'
  actor_id?: string
  actor_name?: string
  amount?: number
  description: string
  created_at: string
}

export interface LiveStream {
  id: string
  host_id: string
  host_name: string
  title: string
  description: string
  thumbnail_url?: string
  viewer_count: number
  is_live: boolean
  stream_key?: string
  started_at?: string
  ended_at?: string
  created_at: string
  updated_at: string
}

export interface Avatar {
  id: string
  user_id: string
  name: string
  gender: 'male' | 'female'
  skin_color: string
  accessories: string[]
  room_id?: string
  position_x: number
  position_y: number
  created_at: string
}

export interface Room {
  id: string
  owner_id: string
  name: string
  description: string
  room_type: 'basic' | 'premium' | 'host'
  template?: string
  furniture?: any[]
  max_users: number
  is_public: boolean
  created_at: string
}

export interface GameSession {
  id: string
  game_type: 'poker' | 'pool' | 'darts' | 'wheel'
  room_id: string
  host_id: string
  participants: string[]
  status: 'waiting' | 'active' | 'finished'
  created_at: string
}

export interface Review {
  id: string
  reviewer_id: string
  reviewed_user_id: string
  rating: number
  comment: string
  auction_id?: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'purchase' | 'sale' | 'withdrawal' | 'deposit' | 'game_win' | 'game_loss' | 'bid'
  amount: number
  description: string
  created_at: string
}

export interface NotificationMessage {
  id: string
  user_id: string
  type: 'stream_live' | 'tip_received' | 'private_room_invite' | 'subscription_renewal' | 'auction_outbid' | 'auction_won' | 'chat_mention'
  title: string
  message: string
  read: boolean
  created_at: string
}
