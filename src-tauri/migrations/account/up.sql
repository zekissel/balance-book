CREATE TABLE account(
  id      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  type_    TEXT NOT NULL,
  balance INTEGER NOT NULL,
  date    TEXT NOT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id)
);