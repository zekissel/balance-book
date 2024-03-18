CREATE TABLE expense (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT NOT NULL,
  desc TEXT,
  date TEXT NOT NULL,
  src_account_id TEXT NOT NULL
);