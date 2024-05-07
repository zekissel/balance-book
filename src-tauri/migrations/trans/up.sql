CREATE TABLE trans(
  id       TEXT PRIMARY KEY,
  store    TEXT NOT NULL,
  amount   INTEGER NOT NULL,
  category TEXT NOT NULL,
  date     TEXT NOT NULL,
  desc     TEXT NOT NULL,
  account_id TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES account(id)
);