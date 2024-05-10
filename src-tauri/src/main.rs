// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use fin::models::PlaidKey;
use serde::Deserialize;
use tauri::State;
use dbase::models::{Account, Trans, User};
use tokio::sync::Mutex;

pub mod dbase;
pub mod fin;

struct AuthState {
  user: Mutex<Option<User>>,
}

#[derive(Deserialize)]
pub struct Index {
  current_page: i32,
  page_size: i8,
  sort_field: String,
  sort_asc: bool,
}

#[derive(Deserialize, Clone)]
pub struct Filters {
  type_: Option<i8>,
  start_date: Option<String>,
  end_date: Option<String>,
  store: Vec<String>,
  category: Vec<String>,
  low_amount: i32,
  high_amount: i32,
  account: Vec<String>,
}

#[tauri::command]
async fn new_account(handle: tauri::AppHandle, state: State<'_, AuthState>, type_: &str, name: &str, balance: i32) -> Result<Account, ()> {

  let user = state.user.lock().await;
  if user.is_none() { return Err(()); }

  let now = chrono::Local::now().naive_local().to_string();
  match user.as_ref() {
    Some(user) => {
      match dbase::api::create_account(handle, None, type_, name, balance, &now, &user.id).await {
        Some(account) => Ok(account),
        None => Err(()),
      }
    },
    None => Err(()),
  }
}

#[tauri::command]
async fn new_transaction(
  handle: tauri::AppHandle, 
  state: State<'_, AuthState>, 
  store: &str, 
  amount: i32, 
  category: &str,
  date: &str,
  account_id: &str,
  desc: Option<&str>,
) -> Result<Trans, ()> {

  let user = state.user.lock().await;
  if user.is_none() { return Err(()); }

  match user.as_ref() {
    Some(_) => {
      match dbase::api::create_trans(handle, None, store, amount, category, date, desc.unwrap_or("n/a"), account_id).await {
        Some(tr) => Ok(tr),
        None => Err(()),
      }
    },
    None => Err(()),
  }
}

#[tauri::command]
async fn fix_transaction(handle: tauri::AppHandle, state: State<'_, AuthState>, id: &str, store: Option<&str>, amount: Option<i32>, category: Option<&str>, date: Option<&str>, desc: Option<&str>, account_id: Option<&str>) -> Result<Option<Trans>, ()> {
  let user = state.user.lock().await;
  if user.is_none() { return Err(()); }

  match user.as_ref() {
    Some(_) => {
      let mut transaction = None;
      match store {
        Some(_) => transaction = dbase::api::update_trans_store(handle.clone(), id, store.unwrap()).await,
        None => (),
      };
      match amount {
        Some(_) => transaction = dbase::api::update_trans_amount(handle.clone(), id, amount.unwrap()).await,
        None => (),
      };
      match category {
        Some(_) => transaction = dbase::api::update_trans_category(handle.clone(), id, category.unwrap()).await,
        None => (),
      };
      match date {
        Some(_) => transaction = dbase::api::update_trans_date(handle.clone(), id, date.unwrap()).await,
        None => (),
      };
      match desc {
        Some(_) => transaction = dbase::api::update_trans_desc(handle.clone(), id, desc.unwrap()).await,
        None => (),
      };
      match account_id {
        Some(_) => transaction = dbase::api::update_trans_account(handle.clone(), id, account_id.unwrap()).await,
        None => (),
      };

      Ok(transaction)
    },
    None => Err(()),
  }
}

#[tauri::command]
async fn remove_transaction(handle: tauri::AppHandle, state: State<'_, AuthState>, id: &str) -> Result<(), ()> {
  let user = state.user.lock().await;
  if user.is_none() { return Err(()); }

  match user.as_ref() {
    Some(_) => {
      dbase::api::delete_trans(handle, id).await;
      Ok(())
    },
    None => Err(()),
  }
}

#[tauri::command]
async fn fetch_account(handle: tauri::AppHandle, state: State<'_, AuthState>) -> Result<Vec<Account>, ()> {
  let user = state.user.lock().await;
  if user.is_none() { return Err(()); }

  match user.as_ref() {
    Some(user) => {
      let accounts = dbase::api::read_account(handle, &user.id).await;
      match accounts {
        Some(accounts) => { 
          Ok(accounts)},
        None => Err(())
      }
    },
    None => Err(())
  }
}
 
#[tauri::command]
async fn fetch_transaction(
  handle: tauri::AppHandle, 
  state: State<'_, AuthState>,
  filters: Filters,
  index: Index,
) -> Result<(Vec<Trans>, i64), ()> {
  let user = state.user.lock().await;
  if user.is_none() { return Err(()); }

  let user_accounts = match dbase::api::read_account(handle.clone(), &user.as_ref().unwrap().id).await {
    Some(accounts) => accounts.iter().map(|a| a.id.clone()).collect(),
    None => vec![],
  };

  match dbase::api::read_trans(handle.clone(), user_accounts.clone(), filters.clone(), Some(index)).await {
    Some(trans) => Ok((trans, dbase::api::count_trans(handle, user_accounts, filters).await)),
    None => Err(()),
  }
}

#[tauri::command]
async fn fetch_transaction_calendar(
  handle: tauri::AppHandle, 
  state: State<'_, AuthState>,
  filters: Filters,
) -> Result<Vec<Trans>, ()> {
  let user = state.user.lock().await;
  if user.is_none() { return Err(()); }

  let user_accounts = match dbase::api::read_account(handle.clone(), &user.as_ref().unwrap().id).await {
    Some(accounts) => accounts.iter().map(|a| a.id.clone()).collect(),
    None => vec![],
  };

  match dbase::api::read_trans(handle.clone(), user_accounts, filters.clone(), None).await {
    Some(trans) => Ok(trans),
    None => Err(()),
  }
}

#[tauri::command]
async fn login(handle: tauri::AppHandle, state: State<'_, AuthState>, name: &str, password: &str) -> Result<Option<User>, ()> {
  match dbase::api::verify_user(handle, name, password).await {
    Some(user) => {
      state.user.lock().await.replace(user.clone());
      Ok(Some(user))
    },
    None => Ok(None)
  }
}

#[tauri::command]
async fn register(handle: tauri::AppHandle, state: State<'_, AuthState>, name: &str, password: &str) -> Result<Option<User>, ()> {
  match dbase::api::create_user(handle, name, password).await {
    Some(user) => {
      state.user.lock().await.replace(user.clone());
      Ok(Some(user))
    },
    None => Ok(None)
  }
}

#[tauri::command]
async fn fix_user(handle: tauri::AppHandle, state: State<'_, AuthState>, name: Option<&str>, password: &str, email:  Option<&str>, new_pass: Option<&str>) -> Result<User, String> {
  let user = state.user.lock().await.take();
  if user.is_none() { return Err("Application error! (1)".to_owned()); }

  let mut ret = "Failed to update user";

  match dbase::api::verify_user(handle.clone(), &user.as_ref().unwrap().name, password).await {
    Some(_) => {
      match new_pass {
        Some(np) => {
          let _ = dbase::api::update_user_password(handle.clone(), &user.as_ref().unwrap().id, np).await;
          ret = "Updated user password";
        },
        None => (),
      };
      match dbase::api::update_user_data(handle, &user.as_ref().unwrap().id, name, email).await {
        Some(u) => {
          state.user.lock().await.replace(u.clone());
          Ok(u)
        },
        None => {
          state.user.lock().await.replace(user.clone().expect("Application error! (3)"));
          Err(ret.to_owned())
        }
      }
    },
    None => { 
      state.user.lock().await.replace(user.clone().expect("Application error! (2)"));
      return Err("Invalid password".to_owned())
    }
  }
}

#[tauri::command]
async fn logout(_handle: tauri::AppHandle, state: State<'_, AuthState>, _id: &str) -> Result<(), ()> {
  state.user.lock().await.take();
  Ok(())
}

#[tauri::command]
async fn remove_user(handle: tauri::AppHandle, state: State<'_, AuthState>, pw: &str) -> Result<bool, String> {
  let user = state.user.lock().await.take();
  if user.is_none() { return Err("Application error! (1)".to_owned()); }

  match dbase::api::verify_user(handle.clone(), &user.as_ref().unwrap().name, pw).await {
    Some(_) => match dbase::api::delete_user(handle, &user.as_ref().unwrap().id).await {
      true => Ok(true),
      false => {
        state.user.lock().await.replace(user.clone().expect("Application error! (3)"));
        Err("Failed to delete user".to_owned())
      }
    },
    None => { 
      state.user.lock().await.replace(user.clone().expect("Application error! (2)"));
      return Err("Invalid password".to_owned())
    }
  }
}

#[tauri::command]
async fn sync_info(handle: tauri::AppHandle, user_id: &str, key: PlaidKey) -> Result<Vec<String>, ()> {
  let mut updated: Vec<String> = vec![];
  let tokens = dbase::api::read_token(handle.clone(), user_id).await;
  for token in tokens { 
    let _ = fin::api::fetch_balance(handle.clone(), key.clone(), token.clone()).await;
    let changed = fin::api::fetch_transactions(handle.clone(), key.clone(), token.clone()).await;
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
async fn get_status(handle: tauri::AppHandle, user_id: &str, key: PlaidKey) -> Result<Vec<fin::models::InstitutionStatus>, ()> {
  let tokens = dbase::api::read_token(handle.clone(), user_id).await;
  let mut status: Vec<fin::models::InstitutionStatus> = vec![];
  for token in tokens { 
    let inst_stat = fin::api::read_status(key.clone(), token).await;
    status.push(inst_stat?);
  }
  Ok(status)
}


fn main() {
  dotenv::dotenv().ok();

  tauri::Builder::default()
    .setup( |app| {
      dbase::api::init(app.handle());
      Ok(())
    })
    .plugin(tauri_plugin_stronghold::Builder::new(|pw| {
      let config = argon2::Config {
        lanes: 2,
        mem_cost: 10_000,
        time_cost: 10,
        thread_mode: argon2::ThreadMode::from_threads(2),
        variant: argon2::Variant::Argon2id,
        ..Default::default()
      };

      let salt = env::var("STRONGHOLD_SALT").unwrap();
      let key = argon2::hash_raw(
        pw.as_ref(),
        salt.as_bytes(),
        &config,
      )
      .expect("failed to hash password");

      key.to_vec()
      }).build())
    .plugin(tauri_plugin_oauth::init())
    .manage(AuthState { user: Mutex::new(None) })
    .invoke_handler(tauri::generate_handler![login, register, fix_user, logout, remove_user, fetch_account, fetch_transaction, fetch_transaction_calendar, new_account, new_transaction, fix_transaction, remove_transaction, fin::auth::authenticate, fin::auth::authorize, fin::auth::open_link, sync_info, get_status])
    .run(tauri::generate_context!())
    .expect("Error while running tauri application");
}