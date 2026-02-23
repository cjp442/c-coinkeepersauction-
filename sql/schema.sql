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

-- ============================================================
-- STREAMING & LIVE BROADCAST SYSTEM
-- ============================================================

-- Streams (each live session)
CREATE TABLE IF NOT EXISTS streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES host_rooms(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_key TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  rtmp_url TEXT,
  hls_url TEXT,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('offline', 'live', 'ended')),
  is_live BOOLEAN NOT NULL DEFAULT FALSE,
  viewer_count INTEGER NOT NULL DEFAULT 0,
  peak_viewer_count INTEGER NOT NULL DEFAULT 0,
  total_tips INTEGER NOT NULL DEFAULT 0,
  recording_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  recording_url TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time stream chat messages
CREATE TABLE IF NOT EXISTS stream_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  is_moderated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream schedules (host can schedule broadcasts)
CREATE TABLE IF NOT EXISTS stream_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream tips / donations (coins)
CREATE TABLE IF NOT EXISTS stream_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
  tipper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipper_username TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOD recordings
CREATE TABLE IF NOT EXISTS stream_vods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  recording_url TEXT NOT NULL,
  thumbnail_url TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream moderators (host-appointed)
CREATE TABLE IF NOT EXISTS stream_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stream_id, user_id)
);

-- Per-stream chat bans
CREATE TABLE IF NOT EXISTS stream_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
  banned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  banned_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stream_id, banned_user_id)
);

-- Stream followers (for "notify when live" feature)
CREATE TABLE IF NOT EXISTS stream_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host_id, follower_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_streams_host_id ON streams(host_id);
CREATE INDEX IF NOT EXISTS idx_streams_status ON streams(status);
CREATE INDEX IF NOT EXISTS idx_stream_chat_stream_id ON stream_chat(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_created_at ON stream_chat(created_at);
CREATE INDEX IF NOT EXISTS idx_stream_schedules_host_id ON stream_schedules(host_id);
CREATE INDEX IF NOT EXISTS idx_stream_schedules_scheduled_at ON stream_schedules(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_stream_tips_stream_id ON stream_tips(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_vods_host_id ON stream_vods(host_id);
CREATE INDEX IF NOT EXISTS idx_stream_followers_host_id ON stream_followers(host_id);
CREATE INDEX IF NOT EXISTS idx_stream_followers_follower_id ON stream_followers(follower_id);

-- Stored Procedures for stream operations

CREATE OR REPLACE FUNCTION increment_stream_viewers(p_stream_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE streams
  SET viewer_count = viewer_count + 1,
      peak_viewer_count = GREATEST(peak_viewer_count, viewer_count + 1),
      updated_at = NOW()
  WHERE id = p_stream_id AND status = 'live';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_stream_viewers(p_stream_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE streams
  SET viewer_count = GREATEST(0, viewer_count - 1),
      updated_at = NOW()
  WHERE id = p_stream_id AND status = 'live';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION send_stream_tip(
  p_stream_id UUID,
  p_tipper_id UUID,
  p_tipper_username TEXT,
  p_amount INTEGER,
  p_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_host_id UUID;
BEGIN
  SELECT host_id INTO v_host_id FROM streams WHERE id = p_stream_id;
  PERFORM deduct_keepers_coins(p_tipper_id, p_amount);
  INSERT INTO stream_tips (stream_id, tipper_id, tipper_username, amount, message)
  VALUES (p_stream_id, p_tipper_id, p_tipper_username, p_amount, p_message);
  UPDATE streams SET total_tips = total_tips + p_amount, updated_at = NOW()
  WHERE id = p_stream_id;
  PERFORM add_keepers_coins(v_host_id, p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION raid_stream(p_from_stream_id UUID, p_to_stream_id UUID)
RETURNS VOID AS $$
DECLARE
  v_viewer_count INTEGER;
BEGIN
  SELECT viewer_count INTO v_viewer_count FROM streams WHERE id = p_from_stream_id;
  UPDATE streams
  SET viewer_count = 0, updated_at = NOW()
  WHERE id = p_from_stream_id;
  UPDATE streams
  SET viewer_count = viewer_count + v_viewer_count,
      peak_viewer_count = GREATEST(peak_viewer_count, viewer_count + v_viewer_count),
      updated_at = NOW()
  WHERE id = p_to_stream_id AND status = 'live';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_vod_views(p_vod_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stream_vods SET views = views + 1 WHERE id = p_vod_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
