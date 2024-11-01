use sqlx::{migrate::MigrateDatabase, Sqlite, SqlitePool};
use tauri::{AppHandle, Manager};
use tokio::sync::Mutex;

pub fn init_db(path: &str, handle: AppHandle) {
    tokio::task::block_in_place(move || {
        tauri::async_runtime::block_on(async move {
            if !Sqlite::database_exists(path).await.unwrap_or(false) {
                println!("creating database at {}", path);
                Sqlite::create_database(path).await?;
                
            }

            let sqlite_pool = SqlitePool::connect_lazy(path).unwrap();
            handle.manage(Mutex::new(sqlite_pool.clone()));

            migrate_users_table(&sqlite_pool).await.unwrap();
            migrate_accounts_table(&sqlite_pool).await.unwrap();
            migrate_transactions_table(&sqlite_pool).await.unwrap();
            migrate_tokens_table(&sqlite_pool).await.unwrap();

            Ok::<(), sqlx::Error>(())
        })
    })
    .unwrap();
}

pub async fn migrate_users_table(sqlite_pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "
    CREATE TABLE IF NOT EXISTS users
    (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      pwhash TEXT NOT NULL,
      salt TEXT NOT NULL,
      UNIQUE (name)
    )
  ",
    )
    .execute(sqlite_pool)
    .await?;

    Ok(())
}

pub async fn migrate_accounts_table(sqlite_pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "
    CREATE TABLE IF NOT EXISTS accounts
    (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type_ TEXT NOT NULL,
      balance INTEGER NOT NULL,
      date TEXT NOT NULL,
      user_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE (name, user_id)
    )
  ",
    )
    .execute(sqlite_pool)
    .await?;

    Ok(())
}

pub async fn migrate_transactions_table(sqlite_pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "
    CREATE TABLE IF NOT EXISTS transactions
    (
      id TEXT PRIMARY KEY,
      store TEXT NOT NULL,
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      desc TEXT NOT NULL,
      account_id TEXT NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts (id)
    )
  ",
    )
    .execute(sqlite_pool)
    .await?;

    Ok(())
}

pub async fn migrate_tokens_table(sqlite_pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "
    CREATE TABLE IF NOT EXISTS tokens
    (
      id TEXT PRIMARY KEY,
      cursor TEXT,
      user_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  ",
    )
    .execute(sqlite_pool)
    .await?;

    Ok(())
}
