CREATE TABLE user (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  uname   TEXT    NOT NULL    UNIQUE,
  pwhash  TEXT    NOT NULL,
  pwsalt  TEXT    NOT NULL,
  email   TEXT                UNIQUE,
  fname   TEXT,
  lname   TEXT,
  dob     TEXT
);