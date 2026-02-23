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
