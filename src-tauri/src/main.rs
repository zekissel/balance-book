// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use database::models::Account;
use database::models::Transaction;
use database::models::User;
use link::api::fetch_transactions;

pub mod database;
pub mod link;


#[tauri::command]
async fn new_account(user_id: &str, account_type: &str, account_id: &str, balance: i32, date: &str) -> Result<Account, ()> {
  Ok(database::api::create_account(None, user_id, account_type, account_id, balance, date).await)
}

#[tauri::command]
async fn get_accounts(user_id: &str) -> Result<Vec<Account>, ()> {
  Ok(database::api::read_account(user_id).await)
}

#[tauri::command]
async fn fix_account(id: &str, account_type: &str, account_id: &str, balance: i32, date: &str) -> Result<Account, ()> {
  Ok(database::api::update_account(id, account_type, account_id, balance, date).await)
}

#[tauri::command]
fn remove_account(id: &str) {
  database::api::delete_account(id);
}

#[tauri::command]
async fn new_transaction(company: &str, amount: i32, category: &str, date: &str, desc: &str, account_id: &str, secondary_id: Option<&str>) -> Result<Transaction, ()> {
  Ok(database::api::create_transaction(None, company, amount, category, date, desc, account_id, secondary_id).await)
}

#[tauri::command]
async fn get_transactions(account_id: Vec<&str>) -> Result<Vec<Transaction>, ()> {
  Ok(database::api::read_transaction(account_id).await)
}

#[tauri::command]
async fn fix_transaction(id: &str, company: &str, amount: i32, category: &str, date: &str, desc: &str, account_id: &str, secondary_id: Option<&str>) -> Result<Transaction, ()> {
  Ok(database::api::update_transaction(id, company, amount, category, date, desc, account_id, secondary_id).await)
}

#[tauri::command]
fn remove_transaction(id: &str) {
    database::api::delete_transaction(id);
}

#[tauri::command]
async fn register(name: &str, password: &str) -> Result<Option<User>, ()> {
  Ok(database::api::create_user(name, password).await)
}

#[tauri::command]
async fn login(name: &str, password: &str) -> Result<Option<User>, ()> {
  Ok(database::api::verify_user(name, password).await)
}

#[tauri::command]
async fn fix_user(id: &str, password: &str, new_pass: Option<&str>, email: Option<&str>, fname: Option<&str>, lname: Option<&str>, dob: Option<&str>) -> Result<Option<User>, ()> {
  match database::api::read_user_by_id(id).await {
    None => return Ok(None),
    Some(user) => match database::api::verify_user(&user.uname, password).await {
      None => return Ok(None),
      Some(user) => {
        match new_pass {
          Some(new_pass) => database::api::update_user_password(id, new_pass).await,
          None => user,
        };
        Ok(database::api::update_user_data(id, email, fname, lname, dob).await)
      },
    },
  }
}

#[tauri::command]
async fn sync_info (user_id: &str) -> Result<bool, ()> {
  let tokens = database::api::read_user_tokens(user_id).await;
  for token in tokens { let _ = fetch_transactions(token).await; }
  Ok(true)
}
  

fn main() {
  dotenv::dotenv().ok();

  tauri::Builder::default()
    .setup(|_app| {
      // Initialize the database.
      database::api::init();

      Ok(())
    })
    .plugin(tauri_plugin_oauth::init())
    .invoke_handler(tauri::generate_handler![new_transaction, get_transactions, fix_transaction, remove_transaction, new_account, get_accounts, fix_account, remove_account, login, register, fix_user, link::auth::authenticate, link::auth::authorize, link::auth::open_link, sync_info])
    .run(tauri::generate_context!())
    .expect("Error while running tauri application");
}
