CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES ('token_rate_usd', '0.10') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('token_package_100', '10.00') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('token_package_500', '45.00') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('token_package_1000', '80.00') ON CONFLICT (key) DO NOTHING;
