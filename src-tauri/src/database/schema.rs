diesel::table! {
  transaction (id) {
    id -> Text,
    company -> Text,
    amount -> Integer,
    category -> Text,
    date -> Text,
    desc -> Text,
    account_id -> Text,
    secondary_id -> Nullable<Text>
  }
}

diesel::table! {
  account (id) {
    id -> Text,
    user_id -> Text,
    account_type -> Text,
    account_name -> Text,
    balance -> Integer,
    date -> Text,
  }
}

diesel::table! {
  user (id) {
    id -> Text,
    uname -> Text,  /* unique */
    pwhash -> Text,
    pwsalt -> Text,
    email -> Nullable<Text>,  /* unique */
    fname -> Nullable<Text>,
    lname -> Nullable<Text>,
    dob -> Nullable<Text>,
  }
}

diesel::table! {
  token (id) {
    id -> Text,
    user_id -> Text,
    item_id -> Text,
    cursor -> Nullable<Text>,
  }
}