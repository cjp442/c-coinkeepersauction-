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
  hls_url?: string
  viewer_count: number
  is_live: boolean
  status: 'offline' | 'live' | 'ended'
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

export interface StreamChatMessage {
  id: string
  stream_id: string
  user_id: string
  username: string
  message: string
  is_moderated: boolean
  created_at: string
}

export interface StreamTip {
  id: string
  stream_id: string
  tipper_id: string
  tipper_username: string
  amount: number
  message?: string
  created_at: string
}

export interface StreamVOD {
  id: string
  stream_id: string
  host_id: string
  title: string
  duration: number
  recording_url: string
  thumbnail_url?: string
  views: number
  created_at: string
}

export interface StreamSchedule {
  id: string
  host_id: string
  title: string
  description?: string
  scheduled_at: string
  notified: boolean
  created_at: string
}

export interface StreamStats {
  viewer_count: number
  peak_viewer_count: number
  total_tips: number
  duration_seconds: number
}

export interface StreamAlert {
  id: string
  type: 'follower' | 'tip' | 'raid'
  stream_id: string
  data: Record<string, unknown>
  created_at: string
}

export type StreamQuality = 'auto' | '720p' | '1080p'
