# Supabase Backend Integration Guide

This guide walks you through setting up all necessary Supabase infrastructure for CoinKeepersAuction.com

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project details:
   - **Name:** coinkeepersauction
   - **Database Password:** (strong password)
   - **Region:** Choose closest to your users
4. Click "Create new project"

## Step 2: Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

Add to `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Create Database Tables

Go to **SQL Editor** and run the following SQL:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'vip', 'host', 'admin')),
  avatar_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Tokens Table
```sql
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  balance INTEGER DEFAULT 0,
  safe_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tokens_user_id ON tokens(user_id);
```

### Auctions Table
```sql
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  starting_bid INTEGER NOT NULL,
  current_bid INTEGER DEFAULT 0,
  highest_bidder_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'ended', 'sold')),
  created_at TIMESTAMP DEFAULT NOW(),
  ends_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auctions_host_id ON auctions(host_id);
CREATE INDEX idx_auctions_status ON auctions(status);
```

### Bids Table
```sql
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id),
  bidder_id UUID NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_bidder_id ON bids(bidder_id);
```

### Live Streams Table
```sql
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_key TEXT UNIQUE,
  viewer_count INTEGER DEFAULT 0,
  is_live BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_live_streams_host_id ON live_streams(host_id);
CREATE INDEX idx_live_streams_is_live ON live_streams(is_live);
```

### Avatars Table
```sql
CREATE TABLE avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  gender TEXT CHECK(gender IN ('male', 'female')),
  skin_color TEXT,
  accessories TEXT[] DEFAULT '{}',
  room_id UUID,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_avatars_user_id ON avatars(user_id);
```

### Rooms Table
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT CHECK(room_type IN ('basic', 'premium', 'host')),
  template TEXT,
  furniture JSONB DEFAULT '[]',
  max_users INTEGER DEFAULT 10,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rooms_owner_id ON rooms(owner_id);
```

### Game Sessions Table
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT CHECK(game_type IN ('poker', 'pool', 'darts', 'wheel')),
  room_id UUID REFERENCES rooms(id),
  host_id UUID NOT NULL REFERENCES users(id),
  participants UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'waiting' CHECK(status IN ('waiting', 'active', 'finished')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_sessions_room_id ON game_sessions(room_id);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewed_user_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  auction_id UUID REFERENCES auctions(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX idx_reviews_auction_id ON reviews(auction_id);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT CHECK(type IN ('purchase', 'sale', 'withdrawal', 'deposit', 'game_win', 'game_loss', 'bid')),
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

## Step 4: Enable Row Level Security (RLS)

For each table, run:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### RLS Policies (Example for users table)

```sql
-- Users can see their own data
CREATE POLICY "Users can see own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can view public user info
CREATE POLICY "Public user info visible" ON users
  FOR SELECT USING (true);
```

## Step 5: Enable Realtime (Optional but Recommended)

1. Go to **Database** → **Replication**
2. Enable publication for tables you want realtime support:
   - notifications
   - room_sessions
   - game_sessions
   - live_streams

## Step 6: Create Storage Buckets

1. Go to **Storage** → **New Bucket**

Create these buckets:
- `auction-images` - for auction item photos
- `verification-documents` - for ID uploads
- `room-customization` - for room decorations
- `avatars` - for avatar images

Set permissions:
- Public read for: auction-images, avatars
- Private for: verification-documents
- Private for: room-customization

### Storage SQL

```sql
INSERT INTO storage.buckets (id, name, public) VALUES
  ('auction-images', 'auction-images', true),
  ('verification-documents', 'verification-documents', false),
  ('room-customization', 'room-customization', false),
  ('avatars', 'avatars', true);
```

## Step 7: Enable Auth

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure password strength requirements
4. Set recovery email options

## Step 8: Create Edge Functions (Optional)

For advanced features like:
- Payment processing
- Email notifications
- Stream verification
- Real-time analytics

Go to **Edge Functions** to deploy custom functions.

## Testing Connection

Add this to a React component to test:

```tsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Test query
const { data, error } = await supabase.from('users').select('*').limit(1)
console.log('Connection test:', data || error)
```

## Troubleshooting

### Connection Failed
- Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- Verify .env.local file exists in project root
- Restart dev server after updating .env

### RLS Policy Errors
- Ensure RLS is enabled on tables
- Check policies allow your user role
- Add debug logging in policies

### Missing Tables
- Verify SQL queries executed without errors
- Check table exists in **Editor** → **Tables**
- Ensure you're in correct project

---

**Supabase setup complete!** Your backend is now ready for the frontend integration.
