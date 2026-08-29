-- Pica — users (Google OAuth) + session store
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,   -- Google sub
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  google_sub TEXT UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
