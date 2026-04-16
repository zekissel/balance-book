use std::env;
//use fin::models::PlaidKey;
use tauri::Manager;


pub mod database;
use database::api;
use database::api_users;
use database::api_accts;
use database::api_trans;
//use database::api_tokens;
pub mod finance;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            let app_data_dir = handle.path().app_data_dir().unwrap();
            if !app_data_dir.exists() {
                std::fs::create_dir(&app_data_dir).unwrap();
            }
            api::init_db(handle.clone());
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            api_users::create_user, api_users::read_users, 
            api_users::update_user, api_users::delete_user,

            api_accts::create_account, api_accts::read_accounts,
            api_accts::update_account, api_accts::delete_account,

            api_trans::create_transaction, api_trans::read_transactions,
            api_trans::update_transaction, api_trans::delete_transaction,

            
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
