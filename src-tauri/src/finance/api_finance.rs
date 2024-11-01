use plaid::PlaidClient;
use plaid::model::*;

use crate::database;

use super::map::extract_category;
use crate::database::models::Token;
use super::models::PlaidKey;
use super::models::InstitutionStatus;

static PLAID_VERSION: &str = "2020-09-14";

pub async fn establish_plaid(key: PlaidKey) -> PlaidClient {

  let client_id = key.client_id;
  let secret = key.secret;

  PlaidClient::with_auth(plaid::PlaidAuth::ClientId {
    client_id, secret, plaid_version: PLAID_VERSION.to_owned(),
  })
  /* {
    // requires env variables: PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, PLAID_VERSION
    PlaidClient::from_env()
  } */
}


async fn sync_transactions(key: PlaidKey, token: Token) -> Result<TransactionsSyncResponse, ()> {
  let access_token = &token.id;
  let cursor = &token.cursor.unwrap_or("".to_string());

  let client = establish_plaid(key).await;
  let response = client
    .transactions_sync(access_token)
    .count(250)
    .cursor(cursor)
    .options(TransactionsSyncRequestOptions {
      days_requested: None,
      include_logo_and_counterparty_beta: None,//Some(true),
      include_original_description: Some(true),
      include_personal_finance_category: Some(true),
    })
    .await
    .unwrap();
  Ok(response)
}



pub async fn fetch_transactions(handle: tauri::AppHandle, key: PlaidKey, token: Token) -> Result<Vec<String>, ()> {
  
  fn format_transaction(
    trans: plaid::model::Transaction
  ) -> (String, String, i32, String, String, String, String) {
    let t_id = trans.transaction_id.to_string();
    let company = trans.name.as_ref().unwrap_or(&"N/A".to_owned()).to_string();
    let amount = (trans.amount * -100.) as i32;
    let date = trans.date.to_string();
    let account_id = trans.account_id.to_string();

    let base = trans.personal_finance_category.unwrap();
    let primary = base.primary.as_ref();
    let detailed = base.detailed.as_ref();
    let category = extract_category(primary, detailed, amount);
    let desc = detailed.to_string();

    (t_id, company, amount, category, date, desc, account_id)
  }

  let mut cursor = token.clone().cursor.unwrap_or("".to_string());
  let mut updated: Vec<String> = vec![];
  let mut more = true;
  let mut count = 1;
  while more {
    println!("Fetching transactions: {:#?} ({:#?})", count, cursor);
    count += 1;
    match sync_transactions(key.clone(), token.clone()).await {
      Ok(mut d) => {
        let mut list = d.added;
        list.append(&mut d.modified);

        for trans in list {
          let new_trans = format_transaction(trans);
          let _ = match database::api_trans::read_trans_by_id(handle.clone(), &new_trans.0).await {
            Ok(_tr) => {
              crate::database::api_trans::update_trans(handle.clone(), &new_trans.0, Some(&new_trans.1), Some(new_trans.2), None, Some(&new_trans.4), Some(&new_trans.5), None).await
            },
            _ => crate::database::api_trans::create_trans(handle.clone(), Some(&new_trans.0), &new_trans.1, new_trans.2, &new_trans.3, &new_trans.4, &new_trans.5, &new_trans.6).await,
          };
          updated.push(new_trans.0);
        };
        for trans in d.removed {
          let _ = crate::database::api_trans::delete_trans(handle.clone(), &trans.transaction_id.unwrap());
        }
        more = d.has_more;
        cursor = d.next_cursor.to_owned();
      },
      Err(_) => more = false,
    };
  };

  let _ = crate::database::api_token::update_cursor(handle, &token.id, Some(cursor)).await.unwrap();

  Ok(updated)
}

pub async fn fetch_balance(handle: tauri::AppHandle, key: PlaidKey, token: Token) -> Result<bool, ()> {
  let client = establish_plaid(key).await;
  let response = client
    .accounts_balance_get(&token.id)
    .await
    .unwrap();

  for acc in response.accounts {
    let a_id = &acc.account_id;
    let balance = (acc.balances.current.unwrap() * 100.) as i64;
    let date = &chrono::Utc::now().to_string();
    let _ = crate::database::api_account::update_account_balance(handle.clone(), &a_id, balance, date).await;
  }
  Ok(true)
}

pub async fn extract_accounts(handle: tauri::AppHandle, user_id: &str, key: PlaidKey, token: Token) -> Result<bool, ()> {
  fn to_upper(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
      None => String::new(),
      Some(f) => f.to_uppercase().chain(c).collect(),
    }
  }

  let client = establish_plaid(key).await;
  let response = client
    .accounts_balance_get(&token.id)
    .await
    .unwrap();

  for acc in response.accounts {
    let a_id = &acc.account_id;
    let account_name = &acc.name;
    let balance = (acc.balances.current.unwrap() * 100.) as i64;
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
    
    let _new_acc = crate::database::api_account::create_account(handle.clone(), Some(a_id), account_name, &account_type, balance, date, user_id).await.unwrap();
  }
  Ok(true)
}


pub async fn read_status(key: PlaidKey, token: Token) -> Result<InstitutionStatus, ()> {
  let client = establish_plaid(key).await;
  let response = client
    .item_get(&token.id)
    .await
    .unwrap();

  let recent = response.status.unwrap().transactions.unwrap().last_successful_update.unwrap().to_string();
  let inst_id = response.item.institution_id.unwrap();

  let response2 = client
    .institutions_get_by_id(&[&"US".to_owned(), &"CA".to_owned()], &inst_id)
    .options(InstitutionsGetByIdRequestOptions {
      include_status: Some(true),
      include_auth_metadata: None,
      include_optional_metadata: None,
      include_payment_initiation_metadata: None,
    })
    .await
    .unwrap();

  let name = response2.institution.name;
  let status = match response2.institution.status {
    Some(is) => match is.transactions_updates {
      Some(tu) => tu.status,
      None => "Unknown".to_owned(),
    },
    None => "Unknown".to_owned(),
  };
  Ok(InstitutionStatus{ name, last_update: recent, status })
}


#[tauri::command]
pub async fn sync_info(handle: tauri::AppHandle, user_id: &str, key: PlaidKey) -> Result<Vec<String>, ()> {
  let mut updated: Vec<String> = vec![];
  let tokens = database::api_token::read_token(handle.clone(), user_id).await.unwrap();
  for token in tokens { 
    let _ = fetch_balance(handle.clone(), key.clone(), token.clone()).await;
    let changed = fetch_transactions(handle.clone(), key.clone(), token.clone()).await;
    match changed {
      Ok(c) => {
        for t_id in c { updated.push(t_id); }
      },
      Err(_) => (),
    }
  }
  Ok(updated)
}

#[tauri::command]
pub async fn get_status(handle: tauri::AppHandle, user_id: &str, key: PlaidKey) -> Result<Vec<InstitutionStatus>, ()> {
  let tokens = database::api_token::read_token(handle.clone(), user_id).await.unwrap();
  let mut status: Vec<InstitutionStatus> = vec![];
  for token in tokens { 
    let inst_stat = read_status(key.clone(), token).await;
    status.push(inst_stat?);
  }
  Ok(status)
}