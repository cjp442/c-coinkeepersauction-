-- ============================================================
-- Multiplayer & Real-Time Networking Schema
-- ============================================================

-- Profiles (lightweight public view used by social features)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Presence ────────────────────────────────────────────────
-- Persisted snapshot of where each player is (supplemented by
-- Supabase Realtime presence channels for live data).
CREATE TABLE IF NOT EXISTS player_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  scene TEXT NOT NULL DEFAULT 'lobby',
  room_id UUID,
  position JSONB NOT NULL DEFAULT '{"x":0,"y":0,"z":0}',
  rotation NUMERIC(6,3) NOT NULL DEFAULT 0,
  animation TEXT NOT NULL DEFAULT 'idle',
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- ── Friends ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requester_username TEXT NOT NULL,
  addressee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  addressee_username TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id)
);

-- ── Blocked players ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id)
);

-- ── Player reports ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reported_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Guilds ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_username TEXT NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guild_members (
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'officer', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (guild_id, user_id)
);

-- ── Chat messages ────────────────────────────────────────────
-- Stores persisted messages for global, guild, and private channels.
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('global', 'guild', 'private')),
  channel_id TEXT,          -- scene/room for global, guild_id for guild, target user_id for private
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender_username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_messages_channel_idx
  ON chat_messages (channel, channel_id, created_at);

-- ── Leaderboards ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('top_spenders', 'most_wins', 'highest_bids')),
  score BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category)
);

CREATE INDEX IF NOT EXISTS leaderboard_category_score_idx
  ON leaderboard_entries (category, score DESC);

-- ── Helper: upsert leaderboard score ─────────────────────────
CREATE OR REPLACE FUNCTION upsert_leaderboard_score(
  p_user_id UUID,
  p_username TEXT,
  p_category TEXT,
  p_delta BIGINT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO leaderboard_entries (user_id, username, category, score)
    VALUES (p_user_id, p_username, p_category, p_delta)
  ON CONFLICT (user_id, category) DO UPDATE
    SET score = leaderboard_entries.score + p_delta,
        username = p_username,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Row-Level Security ────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own friend records"
  ON friends FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );
CREATE POLICY "Users can insert friend requests"
  ON friends FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Addressee can update (accept/decline) requests"
  ON friends FOR UPDATE USING (
    auth.uid() = addressee_id OR auth.uid() = requester_id
  );
CREATE POLICY "Users can delete their own friend records"
  ON friends FOR DELETE USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

ALTER TABLE blocked_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own blocks"
  ON blocked_players FOR ALL USING (auth.uid() = blocker_id);

ALTER TABLE player_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert reports"
  ON player_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can view all reports"
  ON player_reports FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
  );

ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guilds are publicly readable"
  ON guilds FOR SELECT USING (true);
CREATE POLICY "Guild owners can update their guild"
  ON guilds FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated users can create guilds"
  ON guilds FOR INSERT WITH CHECK (auth.uid() = owner_id);

ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guild members are publicly readable"
  ON guild_members FOR SELECT USING (true);
CREATE POLICY "Users can join/leave guilds"
  ON guild_members FOR ALL USING (auth.uid() = user_id);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat messages are publicly readable in channel"
  ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages"
  ON chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboard is publicly readable"
  ON leaderboard_entries FOR SELECT USING (true);

ALTER TABLE player_presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Presence is publicly readable"
  ON player_presence FOR SELECT USING (true);
CREATE POLICY "Users update their own presence"
  ON player_presence FOR ALL USING (auth.uid() = user_id);
