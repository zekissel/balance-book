CREATE TABLE IF NOT EXISTS accounts (
  id        TEXT PRIMARY KEY,
  balance   INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  name      TEXT NOT NULL,
  category  TEXT NOT NULL,
  user_id   TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);