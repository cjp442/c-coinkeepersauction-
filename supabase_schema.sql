-- Supabase Database Schema for Keepers Auction

-- Enable Row Level Security (RLS) for all tables

-- User Profile Table
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT current_timestamp
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy Example (you can define more specific policies)
CREATE POLICY "Select own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Coins Table
CREATE TABLE coins (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user_profiles(id),
    value NUMERIC NOT NULL,
    type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT current_timestamp
);

-- Enable RLS
ALTER TABLE coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select own coins" ON coins
    FOR SELECT
    USING (auth.uid() = user_id);

-- Transactions Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user_profiles(id),
    coin_id INT REFERENCES coins(id),
    amount NUMERIC NOT NULL,
    transaction_date TIMESTAMP DEFAULT current_timestamp
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select own transactions" ON transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Rooms Table
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT current_timestamp
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select rooms" ON rooms
    FOR SELECT
    USING (true);

-- Decor Table
CREATE TABLE decor (
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES rooms(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT current_timestamp
);

-- Enable RLS
ALTER TABLE decor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select decor" ON decor
    FOR SELECT
    USING (true);

-- Bans Table
CREATE TABLE bans (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user_profiles(id),
    reason TEXT NOT NULL,
    ban_date TIMESTAMP DEFAULT current_timestamp
);

-- Enable RLS
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select bans" ON bans
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admin Logs Table
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES user_profiles(id),
    action TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT current_timestamp
);

-- Enable RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select admin logs" ON admin_logs
    FOR SELECT
    USING (auth.uid() = admin_id);