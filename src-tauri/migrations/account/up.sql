CREATE TABLE account (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_type TEXT NOT NULL,
  account_id TEXT NOT NULL,
  balance INTEGER NOT NULL,
  date TEXT NOT NULL
);