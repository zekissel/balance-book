use plaid::PlaidClient;
use plaid::model::*;

pub async fn sync_transactions(access_token: &str, cursor: Option<&str>) -> Result<TransactionsSyncResponse, ()> {
  let client = PlaidClient::from_env();
  let response = client
    .transactions_sync(access_token)
    .count(10)
    .cursor(cursor.unwrap_or(""))
    .options(TransactionsSyncRequestOptions {
      days_requested: Some(1),
      include_logo_and_counterparty_beta: Some(true),
      include_original_description: Some(true),
      include_personal_finance_category: Some(true),
    })
    .await
    .unwrap();
  Ok(response)
}


pub async fn extract_accounts(user_id: &str, access_token: &str) -> Result<bool, ()> {
  let client = PlaidClient::from_env();
  let response = client
    .auth_get(access_token)
    .await
    .unwrap();

  fn to_upper(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
      None => String::new(),
      Some(f) => f.to_uppercase().chain(c).collect(),
    }
  }

  for acc in response.accounts {
    let id = &acc.account_id;
    let account_name = &acc.name;
    let balance = (acc.balances.current.unwrap() * 100.) as i32;
    let date = &"2024-04-01".to_owned();
    let account_type = match acc.type_.as_ref() {
      "depository" => match acc.subtype.as_ref() {
        Some(AccountSubtype(..)) => {
          let inter = format!("{:#?}", acc.subtype.as_ref().unwrap());
          to_upper(inter.split("\"").collect::<Vec<_>>()[1]).to_owned()
        },
        None => "Checking".to_owned(),
      },
      "investment" => "Investment".to_owned(),
      _ => "Other".to_owned(),
    };
    
    let _new_acc = crate::database::api::create_account(Some(id), user_id, &account_type, account_name, balance, date).await;
  }
  Ok(true)
}