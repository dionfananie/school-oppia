-- Pica Games — progres & progress sync state
-- Tabel utama: state per user (Google sub) — JSON blok progress.
CREATE TABLE IF NOT EXISTS pica_state (
  user_id TEXT PRIMARY KEY,
  data TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL
);

-- Tabel log aktivitas ringan utk laporan ortu (opsional — kapan main apa).
CREATE TABLE IF NOT EXISTS pica_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  played_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pica_events_user_time ON pica_events (user_id, played_at);
