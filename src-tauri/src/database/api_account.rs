use super::models::{Account, BookError};
use sqlx::SqlitePool;
use tauri::{Manager, State};
use tokio::sync::Mutex;
use crate::AuthState;


/* MARK: NEW
 */
#[tauri::command]
pub async fn new_account(
    handle: tauri::AppHandle,
    state: State<'_, AuthState>,
    name: &str,
    type_: &str,
    balance: i64,
    date: &str,
) -> Result<(), BookError> {
    
    Ok(())
}


/* MARK: FETCH
 */
#[tauri::command]
pub async fn fetch_account(handle: tauri::AppHandle, state: State<'_, AuthState>) -> Result<Vec<Account>, BookError> {
  let user = state.user.lock().await;

  match user.as_ref() {
    Some(user) => read_account(handle, &user.id).await,
    None => Err(BookError{code: 1, message: "No user found".to_string()}),
  }
}


/* MARK: CREATE
 */
pub async fn create_account(
    handle: tauri::AppHandle,
    id: Option<&str>,
    name: &str,
    type_: &str,
    balance: i64,
    date: &str,
    user_id: &str,
) -> Result<Account, BookError> {
    let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();
    let a_id = match id {
        Some(id) => id.to_string(), 
        None => uuid::Uuid::new_v4().to_string(),
    };

    match sqlx::query(
        "
    INSERT INTO accounts (id, name, type_, balance, date, user_id) 
    VALUES ($1, $2, $3, $4, $5, $6)
  ",
    )
    .bind(a_id.clone())
    .bind(name)
    .bind(type_)
    .bind(balance)
    .bind(date.to_string())
    .bind(user_id.to_string())
    .execute(&pool)
    .await {
        Ok(_) => Ok(Account {
            id: a_id,
            name: name.to_string(),
            type_: type_.to_string(),
            balance,
            date: date.to_string(),
            user_id: user_id.to_string(),
        }),
        Err(e) => Err(BookError { code: 2, message: e.to_string() }),
    }
}


/* MARK: READ
 */
pub async fn read_account(
    handle: tauri::AppHandle,
    user_id: &str
) -> Result<Vec<Account>, BookError> {
    let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();

    let accounts = sqlx::query_as::<_, Account>("
        SELECT * FROM accounts 
        WHERE user_id = $1
    ",)
    .bind(user_id)
    .fetch_all(&pool)
    .await;
    match accounts {
        Ok(accounts) => Ok(accounts),
        Err(e) => Err(BookError { code: 2, message: e.to_string() }),
    }
}


pub async fn update_account_balance(
    handle: tauri::AppHandle,
    id: &str,
    balance: i64,
    date: &str,
) -> Result<(), BookError> {
    let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();

    match sqlx::query("
        UPDATE accounts
        SET balance = $1, date = $2
        WHERE id = $3
    ",)
    .bind(balance)
    .bind(date.to_string())
    .bind(id)
    .execute(&pool)
    .await {
        Ok(_) => Ok(()),
        Err(e) => Err(BookError { code: 2, message: e.to_string() }),
    }
}
