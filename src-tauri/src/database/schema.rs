diesel::table! {
  transactions (id) {
    id -> Text,
    amount -> Integer,
    timestamp -> Text,
    store -> Text,
    category -> Text,
    description -> Text,
    account_id -> Text,
  }
}

diesel::table! {
  accounts (id) {
    id -> Text,
    balance -> Integer,
    timestamp -> Text,
    name -> Text,
    category -> Text,
    user_id -> Text,
  }
}

diesel::table! {
  users (id) {
    id -> Text,
    name -> Text,  /* unique */
  }
}

diesel::table! {
  tokens (id) {
    id -> Text,
    user_id -> Text,
    cursor -> Nullable<Text>,
  }
}