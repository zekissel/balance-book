diesel::table! {
  transaction (id) {
    id -> Integer,
    company -> Text,
    amount -> Integer,
    category -> Text,
    date -> Text,
    desc -> Text,
    account_id -> Integer,
    secondary_id -> Nullable<Integer>
  }
}

diesel::table! {
  account (id) {
    id -> Integer,
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