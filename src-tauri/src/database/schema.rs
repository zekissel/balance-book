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