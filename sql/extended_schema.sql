-- User Profile Extensions
CREATE TABLE IF NOT EXISTS user_profiles_extended (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_name TEXT,
  avatar_color TEXT DEFAULT '#f59e0b',
  current_room_id UUID,
  is_seated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public profiles view (used by admin queries)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','vip','host','admin','banned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE user_profiles_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE keepers_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_decor ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only read/write their own data
CREATE POLICY "Users can view own profile"
  ON user_profiles_extended FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles_extended FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles_extended FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own coins"
  ON keepers_coins FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON coin_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own room"
  ON member_rooms FOR SELECT USING (auth.uid() = owner_id OR is_public = TRUE);

CREATE POLICY "Users can update own room"
  ON member_rooms FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can view own decor"
  ON member_decor FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public profiles"
  ON profiles FOR SELECT USING (TRUE);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), 'user')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO keepers_coins (user_id, balance, safe_balance)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO user_profiles_extended (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Database helper functions
CREATE OR REPLACE FUNCTION get_user_ledger(p_user_id UUID, p_date_from TIMESTAMPTZ DEFAULT NULL, p_date_to TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  id UUID, type TEXT, amount INTEGER, tax_amount INTEGER, net_amount INTEGER,
  description TEXT, created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT ct.id, ct.type, ct.amount, ct.tax_amount, ct.net_amount, ct.description, ct.created_at
  FROM coin_transactions ct
  WHERE ct.user_id = p_user_id
    AND (p_date_from IS NULL OR ct.created_at >= p_date_from)
    AND (p_date_to IS NULL OR ct.created_at <= p_date_to)
  ORDER BY ct.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
