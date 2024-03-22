CREATE TABLE user (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  name    TEXT    NOT NULL    UNIQUE,
  pwhash  TEXT    NOT NULL,
  pwsalt  TEXT    NOT NULL,
  email   TEXT
);