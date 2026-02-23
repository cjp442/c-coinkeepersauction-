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

export interface Auction {
  id: string
  host_id: string
  title: string
  description: string
  image_url?: string
  starting_bid: number
  current_bid: number
  highest_bidder_id?: string
  status: 'pending' | 'active' | 'ended' | 'sold'
  created_at: string
  ends_at: string
}

export interface Bid {
  id: string
  auction_id: string
  bidder_id: string
  amount: number
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

export interface StreamSession {
  id: string
  host_id: string
  host_name: string
  title: string
  status: 'live' | 'ended'
  viewer_count: number
  started_at: string
  ended_at?: string
  created_at: string
}

export interface AuctionItem {
  id: string
  host_id: string
  title: string
  description: string
  image_url?: string
  starting_price: number
  reserve_price?: number
  is_flash_drop: boolean
  flash_quantity?: number
  flash_remaining?: number
  created_at: string
}

export interface LiveAuction {
  id: string
  stream_session_id: string
  auction_item_id: string
  item_title: string
  item_description: string
  item_image_url?: string
  host_id: string
  status: 'active' | 'ended' | 'sold'
  starting_price: number
  current_bid: number
  current_bidder_id?: string
  current_bidder_name?: string
  bid_count: number
  view_count: number
  started_at: string
  ended_at?: string
  final_price?: number
  winner_id?: string
  winner_name?: string
  created_at: string
}

export interface LiveBid {
  id: string
  auction_id: string
  bidder_id: string
  bidder_name: string
  amount: number
  max_bid?: number
  is_proxy: boolean
  created_at: string
}

export interface FlashDrop {
  id: string
  stream_session_id: string
  item_title: string
  price: number
  quantity: number
  remaining: number
  expires_at: string
  created_at: string
}

export interface SellerRating {
  id: string
  seller_id: string
  reviewer_id: string
  reviewer_name: string
  rating: number
  comment: string
  auction_id: string
  created_at: string
}

export interface StreamSchedule {
  id: string
  host_id: string
  host_name: string
  title: string
  scheduled_at: string
  description: string
  notify_count: number
  created_at: string
}

export interface AuctionTip {
  id: string
  auction_id: string
  tipper_id: string
  tipper_name: string
  amount: number
  created_at: string
}
