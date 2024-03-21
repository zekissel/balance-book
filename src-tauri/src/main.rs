// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use database::models::Account;
use database::models::Transaction;

pub mod database;


#[tauri::command]
fn new_account(account_type: &str, account_id: &str, balance: i32, date: &str) -> Account {
    database::api::create_account(account_type, account_id, balance, date)
}

#[tauri::command]
fn get_accounts() -> Vec<Account> {
    database::api::read_account()
}

#[tauri::command]
fn fix_account(id: i32, account_type: &str, account_id: &str, balance: i32, date: &str) -> Account {
    database::api::update_account(id, account_type, account_id, balance, date)
}

#[tauri::command]
fn remove_account(id: i32) {
    database::api::delete_account(id);
}

#[tauri::command]
fn new_transaction(company: &str, amount: i32, category: &str, date: &str, desc: &str, account_id: i32, secondary_id: Option<i32>) -> Transaction {
    database::api::create_transaction(company, amount, category, date, desc, account_id, secondary_id)
}

#[tauri::command]
fn get_transactions() -> Vec<Transaction> {
    database::api::read_transaction()
}

#[tauri::command]
fn fix_transaction(id: i32, company: &str, amount: i32, category: &str, date: &str, desc: &str, account_id: i32, secondary_id: Option<i32>) -> Transaction {
    database::api::update_transaction(id, company, amount, category, date, desc, account_id, secondary_id)
}

#[tauri::command]
fn remove_transaction(id: i32) {
    database::api::delete_transaction(id);
}



fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            // Initialize the database.
            database::api::init();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![new_transaction, get_transactions, fix_transaction, remove_transaction, new_account, get_accounts, fix_account, remove_account])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
