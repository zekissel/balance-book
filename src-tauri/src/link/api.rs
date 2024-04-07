use plaid::PlaidClient;
use plaid::model::*;

use crate::database::models::Token;

pub async fn sync_transactions(access_token: &str, count: i16, cursor: Option<&str>) -> Result<TransactionsSyncResponse, ()> {
  let client = PlaidClient::from_env();
  let response = client
    .transactions_sync(access_token)
    .count(count.into())
    .cursor(cursor.unwrap_or(""))
    .options(TransactionsSyncRequestOptions {
      days_requested: Some(1),
      include_logo_and_counterparty_beta: None,//Some(true),
      include_original_description: Some(true),
      include_personal_finance_category: Some(true),
    })
    .await
    .unwrap();
  println!("{:#?}", response);
  Ok(response)
}

pub async fn fetch_transactions(token: Token, number: i16) -> Result<bool, ()> {
  fn format_transaction(
    trans: plaid::model::Transaction
  ) -> (String, String, i32, String, String, String, String) {
    let t_id = trans.transaction_id.to_string();
    let company = trans.name.as_ref().unwrap_or(&"N/A".to_owned()).to_string();
    let amount = (trans.amount * -100.) as i32;
    let category = trans.category.as_ref().unwrap_or(&vec![if amount < 0 {"Other>Other"} else {"OtherIncome>Other"}.to_string()]).join(", ");
    let date = trans.date.to_string();
    let desc = match trans.personal_finance_category.as_ref() {
      Some(c) => c.primary.to_string(),
      None => "n/a".to_string(),
    };
    let account_id = trans.account_id.to_string();

    (t_id, company, amount, category, date, desc, account_id)
  }

  let mut more = true;
  let mut count = 1;
  let mut cursor: String = token.cursor.as_ref().unwrap_or(&"".to_owned()).to_string();
  while more {
    print!("Fetching transactions: {:#?}", count);
    count += 1;
    match sync_transactions(&token.id, number, Some(&cursor)).await {
      Ok(d) => {
        for trans in d.added {
          let new_trans = format_transaction(trans);
          let _ = match crate::database::api::read_transaction_by_id(&new_trans.0).await {
            Some(_tr) => crate::database::api::update_transaction(&new_trans.0, &new_trans.1, new_trans.2, &new_trans.3, &new_trans.4, &new_trans.5, &new_trans.6, None).await,
            None => crate::database::api::create_transaction(Some(&new_trans.0), &new_trans.1, new_trans.2, &new_trans.3, &new_trans.4, &new_trans.5, &new_trans.6, None).await,
          };
        };
        for trans in d.modified {
          let mod_trans = format_transaction(trans);
          let _ = crate::database::api::update_transaction(&mod_trans.0, &mod_trans.1, mod_trans.2, &mod_trans.3, &mod_trans.4, &mod_trans.5, &mod_trans.6, None).await;
        };
        for trans in d.removed {
          let _ = crate::database::api::delete_transaction(&trans.transaction_id.unwrap());
        }
        more = d.has_more;
        cursor = d.next_cursor.to_owned();
      },
      Err(_) => more = false,
    };
  };
  let _ = crate::database::api::update_token_cursor(&token.id, &cursor).await;

  Ok(true)
}

pub async fn fetch_balance(token: Token) -> Result<bool, ()> {
  let client = PlaidClient::from_env();
  let response = client
    .accounts_balance_get(&token.id)
    .await
    .unwrap();

  for acc in response.accounts {
    let a_id = &acc.account_id;
    let balance = (acc.balances.current.unwrap() * 100.) as i32;
    let date = &chrono::Utc::now().to_string();
    let _ = crate::database::api::update_account_balance(&a_id, balance, date).await;
  }
  Ok(true)
}

pub async fn extract_accounts(user_id: &str, access_token: &str) -> Result<bool, ()> {
  fn to_upper(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
      None => String::new(),
      Some(f) => f.to_uppercase().chain(c).collect(),
    }
  }

  let client = PlaidClient::from_env();
  let response = client
    .accounts_balance_get(access_token)
    .await
    .unwrap();

  for acc in response.accounts {
    let a_id = &acc.account_id;
    let account_name = &acc.name;
    let balance = (acc.balances.current.unwrap() * 100.) as i32;
    let date = &chrono::Utc::now().to_string();
    let account_type = match acc.type_.as_ref() {
      "depository" => match acc.subtype.as_ref() {
        Some(AccountSubtype(..)) => {
          let inter = format!("{:#?}", acc.subtype.as_ref().unwrap());
          to_upper(inter.split("\"").collect::<Vec<_>>()[1])
        },
        None => "Checking".to_owned(),
      },
      "investment" => "Investment".to_owned(),
      "credit" => "Credit".to_owned(),
      "loan" => "Loan".to_owned(),
      _ => "Other".to_owned(),
    };
    
    let _new_acc = crate::database::api::create_account(Some(a_id), user_id, &account_type, account_name, balance, date).await;
  }
  Ok(true)
}