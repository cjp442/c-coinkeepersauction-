-- Keepers Coins / Token Economy
CREATE TABLE IF NOT EXISTS keepers_coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  safe_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase','transfer_in','transfer_out','spend','earn','tax')),
  amount INTEGER NOT NULL,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  net_amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Rooms
CREATE TABLE IF NOT EXISTS host_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_live BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  viewer_count INTEGER DEFAULT 0,
  stream_url TEXT,
  stream_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS member_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  template TEXT DEFAULT 'basic',
  decor JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room Decor Shop
CREATE TABLE IF NOT EXISTS room_decor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  category TEXT CHECK (category IN ('furniture','decoration','wall','floor')),
  model_key TEXT NOT NULL,
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS member_decor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  decor_id UUID REFERENCES room_decor(id) ON DELETE CASCADE NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, decor_id)
);

-- Admin / Moderation
CREATE TABLE IF NOT EXISTS bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  banned_by UUID REFERENCES auth.users(id) NOT NULL,
  banned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Live Stream Auction Engine ──────────────────────────────────────────────

-- Stream Sessions: represent a host's live broadcast
CREATE TABLE IF NOT EXISTS stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'ended')),
  viewer_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stream_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stream_sessions_read_all" ON stream_sessions FOR SELECT USING (true);
CREATE POLICY "stream_sessions_host_write" ON stream_sessions FOR ALL USING (auth.uid() = host_id);

-- Auction Items: items a host queues up to auction
CREATE TABLE IF NOT EXISTS auction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  starting_price INTEGER NOT NULL DEFAULT 0,
  reserve_price INTEGER,
  is_flash_drop BOOLEAN NOT NULL DEFAULT FALSE,
  flash_quantity INTEGER,
  flash_remaining INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE auction_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auction_items_read_all" ON auction_items FOR SELECT USING (true);
CREATE POLICY "auction_items_host_write" ON auction_items FOR ALL USING (auth.uid() = host_id);

-- Live Auctions: one auction per item per stream session
CREATE TABLE IF NOT EXISTS live_auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_session_id UUID REFERENCES stream_sessions(id) ON DELETE CASCADE NOT NULL,
  auction_item_id UUID REFERENCES auction_items(id) ON DELETE CASCADE NOT NULL,
  item_title TEXT NOT NULL,
  item_description TEXT NOT NULL DEFAULT '',
  item_image_url TEXT,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'sold')),
  starting_price INTEGER NOT NULL DEFAULT 0,
  current_bid INTEGER NOT NULL DEFAULT 0,
  current_bidder_id UUID REFERENCES auth.users(id),
  bid_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  final_price INTEGER,
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE live_auctions ENABLE ROW LEVEL SECURITY;
-- KEY RULE: only one active auction per stream at a time (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS one_active_auction_per_stream
  ON live_auctions(stream_session_id) WHERE status = 'active';
CREATE POLICY "live_auctions_read_all" ON live_auctions FOR SELECT USING (true);
CREATE POLICY "live_auctions_host_write" ON live_auctions FOR ALL USING (auth.uid() = host_id);

-- Live Bids: atomic bid records linked to an auction
CREATE TABLE IF NOT EXISTS live_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES live_auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  max_bid INTEGER,    -- proxy bidding ceiling (private)
  is_proxy BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE live_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "live_bids_read_all" ON live_bids FOR SELECT USING (true);
CREATE POLICY "live_bids_auth_write" ON live_bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Seller Ratings
CREATE TABLE IF NOT EXISTS seller_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  auction_id UUID REFERENCES live_auctions(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (seller_id, reviewer_id, auction_id)
);

ALTER TABLE seller_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller_ratings_read_all" ON seller_ratings FOR SELECT USING (true);
CREATE POLICY "seller_ratings_auth_write" ON seller_ratings FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Flash Drops: limited-quantity instant-buy items during a stream
CREATE TABLE IF NOT EXISTS flash_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_session_id UUID REFERENCES stream_sessions(id) ON DELETE CASCADE NOT NULL,
  item_title TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  remaining INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flash_drops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flash_drops_read_all" ON flash_drops FOR SELECT USING (true);

-- Stream Notify Requests: "notify me when host goes live"
CREATE TABLE IF NOT EXISTS stream_notify_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, host_id)
);

ALTER TABLE stream_notify_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stream_notify_own" ON stream_notify_requests FOR ALL USING (auth.uid() = user_id);

-- Auction Tips: coins tipped by viewers during auction for visibility
CREATE TABLE IF NOT EXISTS auction_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES live_auctions(id) ON DELETE CASCADE NOT NULL,
  tipper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE auction_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auction_tips_read_all" ON auction_tips FOR SELECT USING (true);
CREATE POLICY "auction_tips_auth_write" ON auction_tips FOR INSERT WITH CHECK (auth.uid() = tipper_id);

-- ─── Stored procedures for atomic bid placement ───────────────────────────────

-- Place a bid atomically: validates session is live, auction is active, amount >= minimum
CREATE OR REPLACE FUNCTION place_live_bid(
  p_auction_id UUID,
  p_bidder_id UUID,
  p_amount INTEGER,
  p_max_bid INTEGER DEFAULT NULL
) RETURNS live_bids AS $$
DECLARE
  v_auction live_auctions;
  v_session stream_sessions;
  v_min_bid INTEGER;
  v_bid live_bids;
BEGIN
  SELECT * INTO v_auction FROM live_auctions WHERE id = p_auction_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Auction not found'; END IF;
  IF v_auction.status <> 'active' THEN RAISE EXCEPTION 'Auction is not active'; END IF;

  SELECT * INTO v_session FROM stream_sessions WHERE id = v_auction.stream_session_id;
  IF v_session.status <> 'live' THEN
    RAISE EXCEPTION 'Bids are only valid during an active live stream';
  END IF;

  v_min_bid := CASE WHEN v_auction.current_bid = 0 THEN v_auction.starting_price ELSE v_auction.current_bid + 5 END;
  IF p_amount < v_min_bid THEN
    RAISE EXCEPTION 'Bid must be at least % tokens', v_min_bid;
  END IF;

  INSERT INTO live_bids (auction_id, bidder_id, amount, max_bid, is_proxy)
  VALUES (p_auction_id, p_bidder_id, p_amount, p_max_bid, FALSE)
  RETURNING * INTO v_bid;

  UPDATE live_auctions
  SET current_bid = p_amount,
      current_bidder_id = p_bidder_id,
      bid_count = bid_count + 1
  WHERE id = p_auction_id;

  RETURN v_bid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- End a stream and auto-close all active auctions
CREATE OR REPLACE FUNCTION end_stream_session(p_session_id UUID, p_host_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stream_sessions
  SET status = 'ended', ended_at = NOW()
  WHERE id = p_session_id AND host_id = p_host_id;

  -- KEY RULE: stream ends = all active auctions auto-close
  UPDATE live_auctions
  SET status = CASE WHEN current_bid > 0 THEN 'sold' ELSE 'ended' END,
      ended_at = NOW(),
      final_price = NULLIF(current_bid, 0),
      winner_id = CASE WHEN current_bid > 0 THEN current_bidder_id ELSE NULL END
  WHERE stream_session_id = p_session_id AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stored Procedures for token operations
CREATE OR REPLACE FUNCTION add_keepers_coins(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO keepers_coins (user_id, balance) VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) DO UPDATE SET balance = keepers_coins.balance + p_amount, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION deduct_keepers_coins(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE keepers_coins SET balance = balance - p_amount, updated_at = NOW()
  WHERE user_id = p_user_id AND balance >= p_amount;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION transfer_keepers_coins(p_from_user_id UUID, p_to_user_id UUID, p_amount INTEGER, p_tax INTEGER)
RETURNS VOID AS $$
BEGIN
  PERFORM deduct_keepers_coins(p_from_user_id, p_amount);
  PERFORM add_keepers_coins(p_to_user_id, p_amount - p_tax);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION move_to_safe(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE keepers_coins SET balance = balance - p_amount, safe_balance = safe_balance + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id AND balance >= p_amount;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION move_from_safe(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE keepers_coins SET safe_balance = safe_balance - p_amount, balance = balance + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id AND safe_balance >= p_amount;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient safe balance'; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
