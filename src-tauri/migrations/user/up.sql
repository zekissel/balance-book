CREATE TABLE user(
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL,
  pwhash TEXT NOT NULL,
  salt   TEXT NOT NULL,
  email  TEXT
);