CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  date TEXT NOT NULL
);