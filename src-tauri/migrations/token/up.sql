CREATE TABLE token (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  cursor TEXT,
  FOREIGN KEY (user_id) REFERENCES user(id)
);