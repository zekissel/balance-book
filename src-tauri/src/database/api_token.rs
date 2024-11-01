use sqlx::SqlitePool;
use tauri::Manager;
use tokio::sync::Mutex;

use super::models::Token;
use crate::database::models::BookError;

/* MARK: CREATE
 */
pub async fn deposit_token(
  handle: tauri::AppHandle,
  user_id: &str,
  token_id: &str,
) -> Result<Token, BookError> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();
  match sqlx::query("INSERT INTO tokens (id, user_id) VALUES ($1, $2)")
    .bind(token_id)
    .bind(user_id)
    .execute(&pool)
    .await {
      Ok(_) => Ok(Token { 
        id: token_id.to_string(), 
        cursor: None, 
        user_id: user_id.to_string() 
      }),
      Err(e) => Err(BookError { code: 2, message: e.to_string() }),
    }
}

/* MARK: READ
 */
pub async fn read_token(
  handle: tauri::AppHandle,
  user_id: &str,
) -> Result<Vec<Token>, BookError> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();
  let tokens = sqlx::query_as::<_, Token>("
      SELECT * FROM tokens WHERE user_id = $1
    ",)
    .bind(user_id)
    .fetch_all(&pool)
    .await;
    match tokens {
      Ok(tokens) => Ok(tokens),
      Err(e) => Err(BookError { code: 2, message: e.to_string() }),
    }
}

/* MARK: UPDATE
 */
pub async fn update_cursor(
  handle: tauri::AppHandle,
  id: &str,
  cursor: Option<String>,
) -> Result<(), BookError> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();
  
  match sqlx::query("UPDATE tokens SET cursor = $1 WHERE id = $2")
    .bind(cursor)
    .bind(id)
    .execute(&pool)
    .await {
      Ok(_) => Ok(()),
      Err(e) => Err(BookError { code: 2, message: e.to_string() }),
    }
}

/* MARK: DELETE
 */
pub async fn remove_token(
  handle: tauri::AppHandle,
  id: &str,
) -> Result<(), BookError> {
  let pool = handle.state::<Mutex<SqlitePool>>().lock().await.clone();
  
  match sqlx::query("DELETE FROM tokens WHERE id = $1")
    .bind(id)
    .execute(&pool)
    .await {
      Ok(_) => Ok(()),
      Err(e) => Err(BookError { code: 2, message: e.to_string() }),
    }
}