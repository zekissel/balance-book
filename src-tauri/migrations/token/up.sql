CREATE TABLE token (
  id            TEXT PRIMARY KEY,
  user_id       TEXT    NOT NULL,
  item_id       TEXT    NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user (id)
);