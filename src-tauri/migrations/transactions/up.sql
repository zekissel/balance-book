CREATE TABLE IF NOT EXISTS transactions (
  id          TEXT PRIMARY KEY,
  amount      INTEGER NOT NULL,
  timestamp   TEXT NOT NULL,
  store       TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  account_id  TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);