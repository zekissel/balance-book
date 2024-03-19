// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use database::models::Expense;
use database::models::Income;
use database::models::Account;
use database::models::History;

pub mod database;


#[tauri::command]
fn add_expense(store: &str, amount: i32, category: &str, desc: &str, date: &str, account_id: i32) -> Expense {
    database::api::create_expense(store, amount, category, desc, date, account_id)
}

#[tauri::command]
fn load_expenses() -> Vec<Expense> {
    database::api::get_expenses()
}

#[tauri::command]
fn update_expense(id: i32, store: &str, amount: i32, category: &str, desc: &str, date: &str, account_id: i32) -> Expense {
    database::api::update_expense(id, store, amount, category, desc, date, account_id)
}

#[tauri::command]
fn delete_expense(id: i32) {
    database::api::delete_expense(id);
}

#[tauri::command]
fn add_income(source: &str, amount: i32, category: &str, desc: &str, date: &str, account_id: i32) -> Income {
    database::api::create_income(account_id, amount, source, category, date, desc )
}

#[tauri::command]
fn load_income() -> Vec<Income> {
    database::api::get_income()
}

#[tauri::command]
fn update_income(id: i32, source: &str, amount: i32, category: &str, desc: &str, date: &str, account_id: i32) -> Income {
    database::api::update_income(id, account_id, amount, source, category, desc, date)
}

#[tauri::command]
fn delete_income(id: i32) {
    database::api::delete_income(id);
}

#[tauri::command]
fn add_account(account_type: &str, account_id: &str, balance: i32, date: &str) -> Account {
    database::api::create_account(account_type, account_id, balance, date)
}

#[tauri::command]
fn load_account() -> Vec<Account> {
    database::api::get_account()
}

#[tauri::command]
fn update_account(id: i32, account_type: &str, account_id: &str, balance: i32, date: &str) -> Account {
    database::api::update_account(id, account_type, account_id, balance, date)
}

#[tauri::command]
fn delete_account(id: i32) {
    database::api::delete_account(id);
}

#[tauri::command]
fn add_history(account_id: i32, balance: i32, date: &str) -> History {
    database::api::create_history(account_id, balance, date)
}

#[tauri::command]
fn load_history() -> Vec<History> {
    database::api::get_history()
}

#[tauri::command]
fn update_history(id: i32, account_id: i32, balance: i32, date: &str) -> History {
    database::api::update_history(id, account_id, balance, date)
}

#[tauri::command]
fn delete_history(id: i32) {
    database::api::delete_history(id);
}

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            // Initialize the database.
            database::api::init();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![add_expense, load_expenses, update_expense, delete_expense, add_income, load_income, update_income, delete_income, add_account, load_account, update_account, delete_account, add_history, load_history, update_history, delete_history])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
