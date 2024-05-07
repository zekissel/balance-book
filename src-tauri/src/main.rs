// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

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
        Some(accounts) => Ok(accounts),
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

  match dbase::api::read_trans(handle.clone(), filters.clone(), Some(index)).await {
    Some(trans) => Ok((trans, dbase::api::count_trans(handle, filters).await)),
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

  match dbase::api::read_trans(handle.clone(), filters.clone(), None).await {
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

      let salt = b"some_long_and_secure_random_salt";
      let key = argon2::hash_raw(
        pw.as_ref(),
        salt,
        &config,
      )
      .expect("failed to hash password");

      key.to_vec()
      }).build())
    .plugin(tauri_plugin_oauth::init())
    .manage(AuthState { user: Mutex::new(None) })
    .invoke_handler(tauri::generate_handler![login, register, logout, remove_user, fetch_account, fetch_transaction, fetch_transaction_calendar, new_account, new_transaction, fix_transaction, remove_transaction])
    .run(tauri::generate_context!())
    .expect("Error while running tauri application");
}