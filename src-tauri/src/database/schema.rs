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
    user_id -> Integer,
    account_type -> Text,
    account_name -> Text,
    balance -> Integer,
    date -> Text,
  }
}

diesel::table! {
  user (id) {
    id -> Integer,
    name -> Text,
    password -> Text,
    email -> Nullable<Text>,
  }
}