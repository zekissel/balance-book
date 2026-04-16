use diesel::prelude::*;

use super::api::establish_connection;
use super::models::{ Account, AddAccount, UpdateAccount };


/* Account CRUD */
#[tauri::command(rename_all = "snake_case")]
pub async fn create_account(
  app_handle: tauri::AppHandle,
  id_i: Option<&str>,
  balance: i32,
  timestamp: &str,
  name: &str, 
  category: &str,
  user_id: &str,
) -> Result<Option<Account>, String> {
  use super::schema::accounts;

  let id = match id_i {
    Some(i) => &i.to_string(),
    None => &uuid::Uuid::new_v4().to_string(),
  };
  let new_acct = AddAccount { 
    id, balance, timestamp,
    name, category, user_id,
  };
  let acct = diesel::insert_into(accounts::table)
    .values(&new_acct)
    .returning(Account::as_returning())
    .get_result(&mut establish_connection(app_handle.clone()))
    .expect("error saving new account");

  Ok(Some(acct))
}


#[tauri::command(rename_all = "snake_case")]
pub async fn read_accounts(
  app_handle: tauri::AppHandle, 
  user_id_i: &str
) -> Result<Vec<Account>, String> {
  use super::schema::accounts::dsl::*;

  Ok(accounts
    .filter(user_id.eq(user_id_i))
    .load::<Account>(&mut establish_connection(app_handle))
    .expect("error loading accounts"))
}
/*
pub async fn read_account_by_id(app_handle: tauri::AppHandle, id_i: &str) -> Option<Account> {
  use super::schema::account::dsl::*;

  account
    .filter(id.eq(id_i))
    .first::<Account>(&mut establish_connection(app_handle))
    .ok()
} */


#[tauri::command(rename_all = "snake_case")]
pub async fn update_account(
  app_handle: tauri::AppHandle, 
  id_i: &str,
  user_id_i: &str,
  new_balance: Option<i32>,
  new_timestamp: Option<&str>,
  new_name: Option<&str>, 
  new_category: Option<&str>,
) -> Result<Account, String> {
  use super::schema::accounts::dsl::*;

  diesel::update(accounts.filter(id.eq(id_i)))
    .set(&UpdateAccount {
      id: id_i,
      balance: new_balance,
      timestamp: new_timestamp,
      name: new_name,
      category: new_category,
      user_id: user_id_i,
    })
    .returning(Account::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .map_err(|_| "error updating account".to_string())
}



#[tauri::command(rename_all = "snake_case")]
pub async fn delete_account(
  app_handle: tauri::AppHandle, 
  id_i: &str
) -> Result<usize, String> {
  use super::schema::accounts::dsl::*;

  diesel::delete(accounts.filter(id.eq(id_i)))
    .execute(&mut establish_connection(app_handle))
    .map_err(|_| "error deleting account".to_string())
}