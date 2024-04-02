CREATE TABLE account (
  id            TEXT PRIMARY KEY,
  user_id       TEXT    NOT NULL,
  account_type  TEXT    NOT NULL,
  account_name  TEXT    NOT NULL,
  balance       INTEGER NOT NULL,
  date          TEXT    NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user (id)
);