diesel::table! {
  trans (id) {
    id -> Text,
    store -> Text,
    amount -> Integer,
    category -> Text,
    date -> Text,
    desc -> Text,
    account_id -> Text,
  }
}

diesel::table! {
  account (id) {
    id -> Text,
    name -> Text,
    type_ -> Text,
    balance -> Integer,
    date -> Text,
    user_id -> Text,
  }
}

diesel::table! {
  user (id) {
    id -> Text,
    name -> Text,  /* unique */
    pwhash -> Text,
    salt -> Text,
    email -> Nullable<Text>,  /* unique */
  }
}
