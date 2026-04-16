use std::fs;
use std::path::Path;

use diesel::prelude::*;
use diesel::sqlite::{SqliteConnection};
use diesel_migrations::{ embed_migrations, EmbeddedMigrations, MigrationHarness };
use tauri::Manager;


/* ----- initialize database connection and migrate schema ----- */
const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

fn get_db_path(app_handle: tauri::AppHandle) -> String {
  let app_dir = app_handle.path().app_data_dir().unwrap();
  app_dir.to_str().unwrap().to_string() + "/archive/db.sqlite"
}

pub fn establish_connection(app_handle: tauri::AppHandle) -> SqliteConnection {
  let db_path = "sqlite://".to_string() + get_db_path(app_handle).as_str();

  SqliteConnection::establish(&db_path)
    .unwrap_or_else(|_| panic!("Error connecting to {}", db_path))
}

pub fn init_db(app_handle: tauri::AppHandle) {

  fn db_file_exists(app_handle: tauri::AppHandle) -> bool {
    let db_path = get_db_path(app_handle);
    Path::new(&db_path).exists()
  }

  fn create_db_file(app_handle: tauri::AppHandle) {
    let db_path = get_db_path(app_handle);
    let db_dir = Path::new(&db_path).parent().unwrap();
    // If the parent directory does not exist, create it.
    if !db_dir.exists() {
      fs::create_dir_all(db_dir).unwrap();
    }
    fs::File::create(db_path).unwrap();
  }

  if !db_file_exists(app_handle.clone()) { create_db_file(app_handle.clone()); }

  let mut connection = establish_connection(app_handle);
  connection.run_pending_migrations(MIGRATIONS).unwrap();
}