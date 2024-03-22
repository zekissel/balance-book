CREATE TABLE user (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT    NOT NULL    UNIQUE,
  password  TEXT    NOT NULL,
  email     TEXT
);