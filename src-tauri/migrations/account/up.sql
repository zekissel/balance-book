CREATE TABLE account (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  account_type  TEXT    NOT NULL,
  account_name  TEXT    NOT NULL,
  balance       INTEGER NOT NULL,
  date          TEXT    NOT NULL
);