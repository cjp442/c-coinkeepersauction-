-- =============================================================================
-- Migration: Game Platform Schema
-- Tables for the 3D auction game platform
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. keepers_coins
--    User token/coin balances. One row per user.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS keepers_coins (
  user_id        UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance        DECIMAL(18, 8) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  locked_balance DECIMAL(18, 8) NOT NULL DEFAULT 0 CHECK (locked_balance >= 0),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE keepers_coins ENABLE ROW LEVEL SECURITY;

-- Users can read their own balance
CREATE POLICY "keepers_coins: owner can select"
  ON keepers_coins FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own balance (service role bypasses RLS for system ops)
CREATE POLICY "keepers_coins: owner can update"
  ON keepers_coins FOR UPDATE
  USING (auth.uid() = user_id);

-- Row is inserted automatically on sign-up via trigger / service role
CREATE POLICY "keepers_coins: owner can insert"
  ON keepers_coins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. coin_transactions
--    Immutable ledger of every financial event.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coin_transactions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('purchase', 'transfer', 'tax', 'deposit', 'withdrawal', 'reward')),
  amount     DECIMAL(18, 8) NOT NULL,
  tax_amount DECIMAL(18, 8) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  reference  TEXT,
  status     TEXT        NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id    ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type       ON coin_transactions(type);

ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "coin_transactions: owner can select"
  ON coin_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Inserts are performed by service role / edge functions only
CREATE POLICY "coin_transactions: owner can insert"
  ON coin_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. room_decor
--    Catalog of purchasable decorations (no RLS restriction — public catalog).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_decor (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  description      TEXT,
  price_in_coins   DECIMAL(18, 8) NOT NULL CHECK (price_in_coins >= 0),
  category         TEXT        NOT NULL DEFAULT 'general',
  thumbnail_url    TEXT,
  model_url        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_decor_category ON room_decor(category);

ALTER TABLE room_decor ENABLE ROW LEVEL SECURITY;

-- Anyone (authenticated or not) can browse the decor catalog
CREATE POLICY "room_decor: public read"
  ON room_decor FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- 4. member_rooms
--    Each member's personalized room.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_rooms (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_name        TEXT        NOT NULL DEFAULT 'My Room',
  room_design_id   UUID,
  decor_ids        UUID[]      NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT member_rooms_user_unique UNIQUE (user_id)
);

ALTER TABLE member_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_rooms: owner can select"
  ON member_rooms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "member_rooms: owner can insert"
  ON member_rooms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "member_rooms: owner can update"
  ON member_rooms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "member_rooms: owner can delete"
  ON member_rooms FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. member_decor_inventory
--    Tracks which decorations each member owns and the quantity.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_decor_inventory (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decor_id     UUID        NOT NULL REFERENCES room_decor(id) ON DELETE CASCADE,
  quantity     INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT member_decor_inventory_user_decor_unique UNIQUE (user_id, decor_id)
);

CREATE INDEX IF NOT EXISTS idx_member_decor_inventory_user_id  ON member_decor_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_member_decor_inventory_decor_id ON member_decor_inventory(decor_id);

ALTER TABLE member_decor_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_decor_inventory: owner can select"
  ON member_decor_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "member_decor_inventory: owner can insert"
  ON member_decor_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "member_decor_inventory: owner can update"
  ON member_decor_inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "member_decor_inventory: owner can delete"
  ON member_decor_inventory FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6. host_rooms
--    Streaming rooms managed by hosts.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS host_rooms (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_name    TEXT        NOT NULL,
  stream_url   TEXT,
  viewer_count INTEGER     NOT NULL DEFAULT 0 CHECK (viewer_count >= 0),
  is_active    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_host_rooms_host_user_id ON host_rooms(host_user_id);
CREATE INDEX IF NOT EXISTS idx_host_rooms_is_active    ON host_rooms(is_active);

ALTER TABLE host_rooms ENABLE ROW LEVEL SECURITY;

-- Anyone can view active host rooms (public discovery)
CREATE POLICY "host_rooms: public read active"
  ON host_rooms FOR SELECT
  USING (is_active = true);

-- Host can read all their own rooms (active or not)
CREATE POLICY "host_rooms: host can select own"
  ON host_rooms FOR SELECT
  USING (auth.uid() = host_user_id);

CREATE POLICY "host_rooms: host can insert"
  ON host_rooms FOR INSERT
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "host_rooms: host can update"
  ON host_rooms FOR UPDATE
  USING (auth.uid() = host_user_id);

CREATE POLICY "host_rooms: host can delete"
  ON host_rooms FOR DELETE
  USING (auth.uid() = host_user_id);

-- -----------------------------------------------------------------------------
-- 7. admin_logs
--    Immutable audit trail of admin actions.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  action_type     TEXT        NOT NULL,
  target_user_id  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  details         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user_id  ON admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target_user_id ON admin_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action_type    ON admin_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at     ON admin_logs(created_at DESC);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Only the admin who performed the action can read their own logs;
-- a broader admin-role policy should be added via a custom claims approach.
CREATE POLICY "admin_logs: admin actor can select"
  ON admin_logs FOR SELECT
  USING (auth.uid() = admin_user_id);

-- Inserts should be performed by service role only; restrict direct client inserts.
CREATE POLICY "admin_logs: admin actor can insert"
  ON admin_logs FOR INSERT
  WITH CHECK (auth.uid() = admin_user_id);

-- -----------------------------------------------------------------------------
-- 8. bans
--    Banned user records.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bans (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason            TEXT        NOT NULL,
  banned_by_user_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  banned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unbanned_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bans_user_id           ON bans(user_id);
CREATE INDEX IF NOT EXISTS idx_bans_banned_by_user_id ON bans(banned_by_user_id);
CREATE INDEX IF NOT EXISTS idx_bans_unbanned_at       ON bans(unbanned_at);

ALTER TABLE bans ENABLE ROW LEVEL SECURITY;

-- The banned user can view their own ban record
CREATE POLICY "bans: banned user can select own"
  ON bans FOR SELECT
  USING (auth.uid() = user_id);

-- The admin who issued the ban can view it
CREATE POLICY "bans: issuer can select"
  ON bans FOR SELECT
  USING (auth.uid() = banned_by_user_id);

-- Only the issuing admin can insert bans
CREATE POLICY "bans: issuer can insert"
  ON bans FOR INSERT
  WITH CHECK (auth.uid() = banned_by_user_id);

-- Only the issuing admin can update (e.g., set unbanned_at)
CREATE POLICY "bans: issuer can update"
  ON bans FOR UPDATE
  USING (auth.uid() = banned_by_user_id);

-- -----------------------------------------------------------------------------
-- 9. user_profiles_extended
--    Game-specific user data (one row per user).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles_extended (
  user_id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_name     TEXT        NOT NULL DEFAULT 'Keeper',
  avatar_color    TEXT        NOT NULL DEFAULT '#4f46e5',
  current_room_id UUID        REFERENCES member_rooms(id) ON DELETE SET NULL,
  is_seated       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_current_room_id ON user_profiles_extended(current_room_id);

ALTER TABLE user_profiles_extended ENABLE ROW LEVEL SECURITY;

-- Users can read their own extended profile
CREATE POLICY "user_profiles_extended: owner can select"
  ON user_profiles_extended FOR SELECT
  USING (auth.uid() = user_id);

-- Public profile info (avatar name/color) is visible to all authenticated users
CREATE POLICY "user_profiles_extended: authenticated read"
  ON user_profiles_extended FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "user_profiles_extended: owner can insert"
  ON user_profiles_extended FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_extended: owner can update"
  ON user_profiles_extended FOR UPDATE
  USING (auth.uid() = user_id);
