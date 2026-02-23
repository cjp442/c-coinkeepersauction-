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

-- ===========================================================================
-- Auction Engine
-- ===========================================================================

-- Auctions
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('coins','bullion','collectibles','jewelry','art','other')),
  starting_bid INTEGER NOT NULL DEFAULT 1,
  current_bid INTEGER NOT NULL DEFAULT 0,
  reserve_price INTEGER,
  reserve_met BOOLEAN NOT NULL DEFAULT FALSE,
  highest_bidder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bid_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','ended','sold','cancelled')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  snipe_protection_minutes INTEGER NOT NULL DEFAULT 2,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auction items (one auction can have multiple physical items)
CREATE TABLE IF NOT EXISTS auction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  condition TEXT NOT NULL DEFAULT 'ungraded',
  quantity INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  is_proxy BOOLEAN NOT NULL DEFAULT FALSE,
  proxy_max INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proxy bids (sealed max-bid table)
CREATE TABLE IF NOT EXISTS proxy_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  max_amount INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(auction_id, bidder_id)
);

-- Auction history / audit trail
CREATE TABLE IF NOT EXISTS auction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('bid','outbid','reserve_met','started','ended','cancelled','extended')),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount INTEGER,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- Auction stored procedures
-- ===========================================================================

-- Atomically place a bid and update auction state
CREATE OR REPLACE FUNCTION place_bid(
  p_auction_id UUID,
  p_bidder_id UUID,
  p_amount INTEGER
) RETURNS VOID AS $$
DECLARE
  v_auction auctions%ROWTYPE;
  v_min_bid INTEGER;
BEGIN
  SELECT * INTO v_auction FROM auctions WHERE id = p_auction_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Auction not found'; END IF;
  IF v_auction.status != 'active' THEN RAISE EXCEPTION 'Auction is not active'; END IF;
  IF v_auction.highest_bidder_id = p_bidder_id THEN RAISE EXCEPTION 'Already highest bidder'; END IF;

  -- Minimum increment check
  v_min_bid := CASE
    WHEN v_auction.bid_count = 0 THEN v_auction.starting_bid
    WHEN v_auction.current_bid >= 10000 THEN v_auction.current_bid + 250
    WHEN v_auction.current_bid >= 5000 THEN v_auction.current_bid + 100
    WHEN v_auction.current_bid >= 1000 THEN v_auction.current_bid + 50
    WHEN v_auction.current_bid >= 500 THEN v_auction.current_bid + 25
    WHEN v_auction.current_bid >= 100 THEN v_auction.current_bid + 10
    ELSE v_auction.current_bid + 5
  END;

  IF p_amount < v_min_bid THEN
    RAISE EXCEPTION 'Bid % is below minimum %', p_amount, v_min_bid;
  END IF;

  -- Deduct tokens from bidder
  PERFORM deduct_keepers_coins(p_bidder_id, p_amount);
  -- Refund previous highest bidder
  IF v_auction.highest_bidder_id IS NOT NULL THEN
    PERFORM add_keepers_coins(v_auction.highest_bidder_id, v_auction.current_bid);
  END IF;

  INSERT INTO bids (auction_id, bidder_id, amount) VALUES (p_auction_id, p_bidder_id, p_amount);

  UPDATE auctions SET
    current_bid = p_amount,
    highest_bidder_id = p_bidder_id,
    bid_count = bid_count + 1,
    reserve_met = (reserve_price IS NULL OR p_amount >= reserve_price),
    updated_at = NOW()
  WHERE id = p_auction_id;

  INSERT INTO auction_history (auction_id, event_type, actor_id, amount, description)
  VALUES (p_auction_id, 'bid', p_bidder_id, p_amount,
    format('Bid of %s tokens placed', p_amount));

  -- Snipe protection: extend if bid in final window
  UPDATE auctions SET
    ends_at = NOW() + (snipe_protection_minutes * interval '1 minute'),
    updated_at = NOW()
  WHERE id = p_auction_id
    AND snipe_protection_minutes > 0
    AND ends_at - NOW() < (snipe_protection_minutes * interval '1 minute')
    AND ends_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Finalise ended auctions (run periodically via pg_cron)
CREATE OR REPLACE FUNCTION finalise_ended_auctions() RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_auction auctions%ROWTYPE;
BEGIN
  FOR v_auction IN
    SELECT * FROM auctions
    WHERE status = 'active' AND ends_at <= NOW()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE auctions SET
      status = CASE WHEN reserve_met THEN 'sold' ELSE 'ended' END,
      updated_at = NOW()
    WHERE id = v_auction.id;

    INSERT INTO auction_history (auction_id, event_type, description)
    VALUES (v_auction.id, 'ended',
      CASE WHEN v_auction.reserve_met THEN 'Auction ended – item sold'
           ELSE 'Auction ended – reserve not met' END);

    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
