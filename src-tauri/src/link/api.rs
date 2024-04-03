use plaid::PlaidClient;
use plaid::model::*;

use crate::database::models::Transaction;
use crate::database::models::Token;

pub async fn sync_transactions(access_token: &str, cursor: Option<&str>) -> Result<TransactionsSyncResponse, ()> {
  let client = PlaidClient::from_env();
  let response = client
    .transactions_sync(access_token)
    .count(300)
    .cursor(cursor.unwrap_or(""))
    .options(TransactionsSyncRequestOptions {
      days_requested: Some(1),
      include_logo_and_counterparty_beta: None,//Some(true),
      include_original_description: Some(true),
      include_personal_finance_category: None, //Some(true),
    })
    .await
    .unwrap();
  Ok(response)
}

pub async fn fetch_transactions(token: Token) -> Result<Vec<Transaction>, ()> {
  let mut more = true;
  let mut resp = Vec::new();
  let mut count = 0;
  let mut cursor: String = token.cursor.as_ref().unwrap_or(&"".to_owned()).to_string();
  while more {
    print!("Fetching transactions: {:#?}", count);
    count += 1;
    match sync_transactions(&token.id, Some(&cursor)).await {
      Ok(d) => {
        for trans in d.added {
          let id = &trans.transaction_id;
          let company = &trans.merchant_name.as_ref().unwrap_or(&"N/A".to_owned()).to_string();
          let amount = (trans.amount * 100.) as i32;
          let category = &trans.category.as_ref().unwrap_or(&vec!["n/a".to_string()]).join(", ");
          let date = &trans.date.to_string();
          let desc = &trans.name.as_ref().unwrap_or(&"n/a".to_owned()).to_string();
          let account_id = &trans.account_id;
          let secondary_id = None;

          let transaction = crate::database::api::create_transaction(Some(id), company, amount, category, date, desc, account_id, secondary_id).await;
          resp.push(transaction);
          more = d.has_more;
          cursor = d.next_cursor.to_owned();
        };
      },
      Err(_) => more = false,
    };
  };
  let _ = crate::database::api::update_token_cursor(&token.id, &cursor).await;

  print!("{:#?}", resp);
  Ok(resp)
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
          to_upper(inter.split("\"").collect::<Vec<_>>()[1])
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