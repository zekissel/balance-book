CREATE TABLE token (
  id      INTEGER  PRIMARY KEY AUTOINCREMENT,
  user_id TEXT     NOT NULL,
  token_id   TEXT     NOT NULL,
  item_id TEXT     NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user (id)
);