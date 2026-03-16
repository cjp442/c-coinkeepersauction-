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

// --- Multiplayer / Social Types ---

export type EmoteType = 'wave' | 'dance' | 'celebrate'

export interface PlayerPresence {
  user_id: string
  username: string
  avatar_id?: string
  scene: string
  room_id?: string
  position: { x: number; y: number; z: number }
  rotation: number
  animation: 'idle' | 'walk' | 'run' | 'sit'
  emote?: EmoteType | null
  online_at: string
}

export interface ChatMessage {
  id: string
  channel: 'global' | 'guild' | 'private'
  channel_id?: string   // guild_id for guild chat, target user_id for private
  sender_id: string
  sender_username: string
  content: string
  created_at: string
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined'

export interface FriendRequest {
  id: string
  requester_id: string
  requester_username: string
  addressee_id: string
  addressee_username: string
  status: FriendRequestStatus
  created_at: string
}

export interface BlockedPlayer {
  id: string
  blocker_id: string
  blocked_id: string
  blocked_username: string
  created_at: string
}

export interface Guild {
  id: string
  name: string
  description?: string
  owner_id: string
  owner_username: string
  member_count: number
  created_at: string
}

export interface GuildMember {
  guild_id: string
  user_id: string
  username: string
  role: 'owner' | 'officer' | 'member'
  joined_at: string
}

export type LeaderboardCategory = 'top_spenders' | 'most_wins' | 'highest_bids'

export type PlayerTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  score: number
  tier: PlayerTier
  category: LeaderboardCategory
}
