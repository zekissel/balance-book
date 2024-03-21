CREATE TABLE 'transaction' (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  company       TEXT    NOT NULL,
  amount        INTEGER NOT NULL,
  category      TEXT    NOT NULL,
  date          TEXT    NOT NULL,
  desc          TEXT    NOT NULL,
  account_id    INTEGER NOT NULL,
  secondary_id  INTEGER
);