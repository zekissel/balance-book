use super::models::Transaction;
use sqlx::SqlitePool;
use tauri::{Manager, State};
use tokio::sync::Mutex;

use serde::Deserialize;
use crate::AuthState;
use crate::database::models::BookError;
use crate::database;

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


/* MARK: NEW
 */
#[tauri::command]
pub async fn new_transaction(
  handle: tauri::AppHandle,
  store: &str,
  amount: i32,
  category: &str,
  date: &str,
  desc: &str,
  account_id: &str,
) -> Result<(), BookError> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();
  let id = uuid::Uuid::new_v4().to_string();

  match sqlx::query("
      INSERT INTO transactions (id, store, amount, category, date, desc, account_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    ")
    .bind(id)
    .bind(store)
    .bind(amount)
    .bind(category)
    .bind(date)
    .bind(desc)
    .bind(account_id)
    .execute(&pool)
    .await {
      Ok(_) => Ok(()),
      Err(e) => Err(BookError { code: 2, message: e.to_string() }),
    }

}


/* MARK: FETCH
*/
#[tauri::command]
pub async fn fetch_transaction(
  handle: tauri::AppHandle, 
  state: State<'_, AuthState>,
  filters: Filters,
  index: Index,
) -> Result<(Vec<Transaction>, i64), ()> {
  let user = state.user.lock().await;
  if user.is_none() { return Err(()); }

  let user_accounts = match database::api_account::read_account(handle.clone(), &user.as_ref().unwrap().id).await {
    Ok(accounts) => accounts.iter().map(|a| a.id.clone()).collect(),
    _ => vec![],
  };

  match read_trans(handle.clone(), user_accounts.clone(), filters.clone(), Some(index)).await {
    Some(trans) => Ok((trans, count_trans(handle, user_accounts, filters).await)),
    None => Err(()),
  }
}

#[tauri::command]
pub async fn fetch_transaction_calendar(
  handle: tauri::AppHandle, 
  state: State<'_, AuthState>,
  filters: Filters,
) -> Result<Vec<Transaction>, ()> {
  let user = state.user.lock().await;
  if user.is_none() { return Err(()); }

  let user_accounts = match database::api_account::read_account(handle.clone(), &user.as_ref().unwrap().id).await {
    Ok(accounts) => accounts.iter().map(|a| a.id.clone()).collect(),
    _ => vec![],
  };

  match read_trans(handle.clone(), user_accounts, filters.clone(), None).await {
    Some(trans) => Ok(trans),
    None => Err(()),
  }
}

/* MARK: FIX
*/
#[tauri::command]
pub async fn fix_transaction(
  handle: tauri::AppHandle,
  id: &str,
  // TODO
) -> Result<(), BookError> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();
  match sqlx::query("
      UPDATE transactions SET TODO = 1 
      WHERE id = $1
    ")
    .bind(id)
    .execute(&pool)
    .await {
      Ok(_) => Ok(()),
      Err(e) => Err(BookError { code: 2, message: e.to_string() }),
    }
}

/* MARK: REMOVE
*/
#[tauri::command]
pub async fn remove_transaction(
  handle: tauri::AppHandle,
  id: &str,
) -> Result<(), BookError> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();
  match sqlx::query("
      DELETE FROM transactions WHERE id = $1
    ")
    .bind(id)
    .execute(&pool)
    .await {
      Ok(_) => Ok(()),
      Err(e) => Err(BookError { code: 2, message: e.to_string() }),
    }
}


/* MARK: UTIL
 */
async fn read_trans(
  handle: tauri::AppHandle,
  user_accounts: Vec<String>,
  filters: Filters,
  index: Option<Index>,
) -> Option<Vec<Transaction>> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();

  let mut transactions = vec![];
  for account in user_accounts.iter() {
    let query = sqlx::query_as::<_, Transaction>("
      SELECT * FROM transactions
      WHERE account_id = $1
    ")
    .bind(account);
    /*if let Some(index) = index {
      query
        .bind(index.limit)
        .bind(index.offset);
    }*/
    transactions.extend(query.fetch_all(&pool).await.unwrap());
  }
  Some(transactions)
}

async fn count_trans(
  handle: tauri::AppHandle,
  user_accounts: Vec<String>,
  filters: Filters,
) -> i64 {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();
  let mut count = 0;
  for account in user_accounts.iter() {
    let query = sqlx::query_as::<_, Transaction>("
      SELECT * FROM transactions
      WHERE account_id = $1
    ")
    .bind(account);
    count += query.fetch_all(&pool).await.unwrap().len() as i64;
  }
  count
}



/* MARK: CREATE
 */
pub async fn create_trans(
  handle: tauri::AppHandle,
  id: Option<&str>,
  store: &str,
  amount: i32,
  category: &str,
  date: &str,
  desc: &str,
  account_id: &str,
) -> Result<(), BookError> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();
  let t_id = match id {
    Some(id) => id.to_string(), 
    None => uuid::Uuid::new_v4().to_string(),
  };

  match sqlx::query(
    "
    INSERT INTO transactions (id, store, amount, category, date, desc, account_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  ",
  )
  .bind(t_id.clone())
  .bind(store)
  .bind(amount)
  .bind(category)
  .bind(date)
  .bind(desc)
  .bind(account_id)
  .execute(&pool)
  .await {
    Ok(_) => Ok(()),
    Err(e) => Err(BookError { code: 2, message: e.to_string() }),
  }

  //let trans = read_trans_by_id(handle.clone(), &t_id).await.unwrap();
}

/* MARK: READ
 */
pub async fn read_trans_by_id(
  handle: tauri::AppHandle,
  id: &str,
) -> Result<Transaction, BookError> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();

  let trans = sqlx::query_as::<_, Transaction>("
    SELECT * FROM transactions WHERE id = $1 LIMIT 1
  ",)
  .bind(id)
  .fetch_one(&pool)
  .await;

  match trans {
    Ok(trans) => Ok(trans),
    Err(e) => Err(BookError { code: 2, message: e.to_string() }),
  }
}

/* MARK: UPDATE
 */
pub async fn update_trans(
  handle: tauri::AppHandle,
  id: &str,
  store: Option<&str>,
  amount: Option<i32>,
  category: Option<&str>,
  date: Option<&str>,
  desc: Option<&str>,
  account_id: Option<&str>,
) -> Result<(), BookError> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();

  

  Ok(())
}

/* MARK: DELETE 
*/
pub async fn delete_trans(
  handle: tauri::AppHandle,
  id: &str,
) -> Result<(), BookError> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();
  match sqlx::query(
    "
    DELETE FROM transactions WHERE id = $1
  ",
  )
  .bind(id)
  .execute(&pool)
  .await {
    Ok(_) => Ok(()),
    Err(e) => Err(BookError { code: 2, message: e.to_string() }),
  }
}

