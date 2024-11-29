use super::models::Transaction;
use sqlx::query::QueryAs;
use sqlx::SqlitePool;
use sqlx::{query_builder::QueryBuilder, Execute};
use tauri::{Manager, State};
use tokio::sync::Mutex;

use serde::Deserialize;
use crate::AuthState;
use crate::database::models::BookError;
use crate::database;

#[derive(Deserialize)]
pub struct Index {
  current_page: u32,
  page_size: u8,
  sort_field: u8,
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

  println!("{}", date);

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
) -> Result<(Vec<Transaction>, i64), BookError> {
  let user = state.user.lock().await;
  if user.is_none() { return Err(BookError { code: 1, message: "User not found".to_string() }); }

  let user_accounts = match database::api_account::read_account(handle.clone(), &user.as_ref().unwrap().id).await {
    Ok(accounts) => accounts.iter().map(|a| a.id.clone()).collect(),
    _ => vec![],
  };

  match read_trans(handle.clone(), user_accounts.clone(), filters.clone(), Some(index)).await {
    Some(trans) => Ok((trans, count_trans(handle, user_accounts, filters).await)),
    None => Err(BookError { code: 2, message: "Error reading transactions".to_string() }),
  }
}

#[tauri::command]
pub async fn fetch_transaction_calendar(
  handle: tauri::AppHandle, 
  state: State<'_, AuthState>,
  filters: Filters,
) -> Result<Vec<Transaction>, BookError> {
  let user = state.user.lock().await;
  if user.is_none() { return Err(BookError { code: 1, message: "User not found".to_string() }); }

  let user_accounts = match database::api_account::read_account(handle.clone(), &user.as_ref().unwrap().id).await {
    Ok(accounts) => accounts.iter().map(|a| a.id.clone()).collect(),
    _ => vec![],
  };

  match read_trans(handle.clone(), user_accounts, filters.clone(), None).await {
    Some(trans) => Ok(trans),
    None => Err(BookError { code: 2, message: "Error reading transactions".to_string() }),
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

  let exclude_accounts = filters.account.contains(&"X".to_owned());
  let exclude_stores = filters.store.contains(&"X".to_owned());
  let exclude_categories = filters.category.contains(&"X".to_owned());

  let mut query_string: QueryBuilder<'_, sqlx::sqlite::Sqlite> = QueryBuilder::new("
    SELECT * FROM transactions
    WHERE account_id IN ("
  );
  // filters active, exclude option, account is in list
  struct A(bool, bool, bool);
  for account in user_accounts.iter() {
    match A(filters.account.len() > 0, exclude_accounts, filters.account.contains(account)) {
      A(true, true, true) => continue,
      A(true, false, false) => continue,
      _ => {
        query_string.push_bind(account.clone());
        query_string.push(",");
      },
    }
  }
  // remove last comma
  query_string = QueryBuilder::new(
    &query_string.sql()[..query_string.sql().len()-1]
  );
  query_string.push(")");

  if let Some(ref start_date) = filters.start_date {
    query_string.push(" AND date >= ");
    query_string.push_bind(start_date.clone());
  };
  if let Some(ref end_date) = filters.end_date {
    query_string.push(" AND date <= ");
    query_string.push_bind(end_date.clone());
  };

  if filters.store.len() > 0 {
    if exclude_stores { query_string.push(" AND store NOT IN ("); }
    else { query_string.push(" AND store IN ("); }
    for store in filters.store.iter() {
      if store == "X" { continue; }
      query_string.push_bind(store.clone());
      query_string.push(",");
    }
    // remove last comma
    query_string = QueryBuilder::new(
      &query_string.sql()[..query_string.sql().len()-1]
    );
    query_string.push(")");
  }
  
  if filters.category.len() > 0 {
    if exclude_categories { query_string.push(" AND category NOT IN ("); }
    else { query_string.push(" AND category IN ("); }
    for category in filters.category.iter() {
      if category == "X" { continue; }
      query_string.push_bind(category.clone());
      query_string.push(",");
    }
    query_string = QueryBuilder::new(
      &query_string.sql()[..query_string.sql().len()-1]
    );
    query_string.push(")");
  }

  if filters.low_amount > 0 {
    query_string.push(" AND (amount >= ");
    query_string.push_bind(filters.low_amount);
    query_string.push(" OR amount <= -");
    query_string.push_bind(filters.low_amount);
    query_string.push(")");
  }
  if filters.high_amount > 0 {
    query_string.push(" AND amount <= ");
    query_string.push_bind(filters.high_amount.clone());
  }

  if let Some(ref index) = index {
    query_string.push(" ORDER BY ");
    match index.sort_field {
      1 => query_string.push("store"),
      2 => query_string.push("category"),
      3 => query_string.push("amount"),
      4 => query_string.push("account_id"),
      _ => query_string.push("date"),
    };

    match index.sort_asc {
      true => query_string.push(" ASC".to_string()),
      false => query_string.push(" DESC".to_string()),
    };

    query_string.push(" LIMIT ");
    match index.page_size {
      50 => query_string.push("50"),
      100 => query_string.push("100"),
      200 => query_string.push("200"),
      _ => query_string.push("25"),
    };

    query_string.push(" OFFSET ");
    query_string.push((index.current_page - 1).to_string());
  }

  let sql = query_string.build().sql();
  println!("{}", sql);

  let mut query = sqlx::query_as::<_, Transaction>(
    sql//query_string.build().sql()
  );
  for account in user_accounts.iter() {
    match A(filters.account.len() > 0, exclude_accounts, filters.account.contains(account)) {
      A(true, true, true) => continue,
      A(true, false, false) => continue,
      _ => {
        query = query.bind(account.clone());
      },
    }
  }

  query = query
    .bind(filters.start_date.clone())
    .bind(filters.end_date.clone());

  for store in filters.store.iter() {
    if store == &"X".to_owned() { continue; }
    query = query.bind(store.clone());
  }
  for cat in filters.category.iter() {
    if cat == &"X".to_owned() { continue; }
    query = query.bind(cat.clone());
  }
  if filters.low_amount > 0 {
    query = query.bind(filters.low_amount).bind(filters.low_amount);
  }
  if filters.high_amount > 0 {
    query = query.bind(filters.high_amount.clone());
  }

  match query.fetch_all(&pool).await {
    Ok(trans) => transactions.extend(trans),
    Err(_) => (),
  };

    //transactions.extend(query.fetch_all(&pool).await.unwrap());
  //}
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

