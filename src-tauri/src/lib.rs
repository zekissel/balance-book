mod database;
mod finance;

use crate::database::schema;
use crate::database::api_user::{logout_user, register_user, verify_user};
use crate::database::api_account::{new_account, fetch_account};
use crate::database::api_trans::{new_transaction, fix_transaction, fetch_transaction, fetch_transaction_calendar, remove_transaction};

use crate::finance::auth::{authenticate, authorize, open_link};
use crate::finance::api_finance::{get_status, sync_info};

use tauri::Manager;
use tokio::sync::Mutex;
use crate::database::models::User;

pub struct AuthState {
    user: Mutex<Option<User>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    std::env::set_var("PLAID_ENV", "sandbox");

    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            let app_data_dir = handle.path().app_data_dir().unwrap();
            if !app_data_dir.exists() {
                std::fs::create_dir(&app_data_dir).unwrap();
            }

            schema::init_db(
                app_data_dir.join("archive.db").to_str().unwrap(),
                handle.clone(),
            );
            Ok(())
        })
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .manage(AuthState {
            user: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            register_user, verify_user, logout_user,
            authenticate, authorize, open_link,
            get_status, sync_info,
            new_account, fetch_account,
            new_transaction, fix_transaction, remove_transaction,
            fetch_transaction, fetch_transaction_calendar,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}