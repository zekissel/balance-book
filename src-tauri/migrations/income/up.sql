CREATE TABLE income (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT NOT NULL,
  desc TEXT,
  date TEXT NOT NULL,
  dest_account_id TEXT NOT NULL
);