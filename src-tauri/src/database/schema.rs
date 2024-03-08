diesel::table! {
  expense (id) {
      id -> Integer,
      store -> Text,
      amount -> Integer,
      category -> Text,
      desc -> Text,
      date -> Text,
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
  }
}