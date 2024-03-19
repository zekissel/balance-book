diesel::table! {
  expense (id) {
      id -> Integer,
      store -> Text,
      amount -> Integer,
      category -> Text,
      desc -> Text,
      date -> Text,
      account_id -> Integer,
  }
}

diesel::table! {
  income (id) {
      id -> Integer,
      account_id -> Integer,
      amount -> Integer,
      source -> Text,
      category -> Text,
      date -> Text,
      desc -> Text,
  }
}

diesel::table! {
  account (id) {
      id -> Integer,
      account_type -> Text,
      account_name -> Text,
      balance -> Integer,
      date -> Text,
  }
}

diesel::table! {
  history (id) {
      id -> Integer,
      account_id -> Integer,
      balance -> Integer,
      date -> Text,
  }
}