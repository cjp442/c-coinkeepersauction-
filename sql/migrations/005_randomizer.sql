CREATE TABLE IF NOT EXISTS randomizer_wheels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES host_rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token_cost INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS randomizer_wheel_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wheel_id UUID REFERENCES randomizer_wheels(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  prize_tokens INTEGER NOT NULL DEFAULT 0,
  weight INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS randomizer_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wheel_id UUID REFERENCES randomizer_wheels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  winning_item_id UUID REFERENCES randomizer_wheel_items(id),
  tokens_spent INTEGER NOT NULL,
  tokens_won INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
