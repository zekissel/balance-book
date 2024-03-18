diesel::table! {
  expense (id) {
      id -> Integer,
      store -> Text,
      amount -> Integer,
      category -> Text,
      desc -> Text,
      date -> Text,
      src_account_id -> Text,
  }
}

diesel::table! {
  income (id) {
      id -> Integer,
      source -> Text,
      amount -> Integer,
      category -> Text,
      desc -> Text,
      date -> Text,
      dest_account_id -> Text,
  }
}

diesel::table! {
  account (id) {
      id -> Integer,
      account_type -> Text,
      account_id -> Text,
      balance -> Integer,
      date -> Text,
  }
}

diesel::table! {
  history (date) {
      id -> Integer,
      balance -> Integer,
      date -> Text,
  }
}