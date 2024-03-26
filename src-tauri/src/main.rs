// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use database::api::read_user_by_id;
use database::models::Account;
use database::models::Transaction;
use database::models::User;

pub mod database;


#[tauri::command]
fn new_account(user_id: i32, account_type: &str, account_id: &str, balance: i32, date: &str) -> Account {
    database::api::create_account(user_id, account_type, account_id, balance, date)
}

#[tauri::command]
fn get_accounts(user_id: i32) -> Vec<Account> {
    database::api::read_account(user_id)
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
fn get_transactions(account_id: Vec<i32>) -> Vec<Transaction> {
    database::api::read_transaction(account_id)
}

#[tauri::command]
fn fix_transaction(id: i32, company: &str, amount: i32, category: &str, date: &str, desc: &str, account_id: i32, secondary_id: Option<i32>) -> Transaction {
    database::api::update_transaction(id, company, amount, category, date, desc, account_id, secondary_id)
}

#[tauri::command]
fn remove_transaction(id: i32) {
    database::api::delete_transaction(id);
}

#[tauri::command]
fn register(name: &str, password: &str) -> Option<User> {
    database::api::create_user(name, password)
}

#[tauri::command]
fn login(name: &str, password: &str) -> Option<User> {
    database::api::verify_user(name, password)
}

#[tauri::command]
fn fix_user(id: i32, password: &str, new_pass: Option<&str>, email: Option<&str>, fname: Option<&str>, lname: Option<&str>, dob: Option<&str>) -> Option<User> {
    match read_user_by_id(id) {
        None => return None,
        Some(user) => match database::api::verify_user(&user.uname, password) {
            None => return None,
            Some(user) => {
                match new_pass {
                    Some(new_pass) => database::api::update_user_password(id, new_pass),
                    None => user,
                };
                Some(database::api::update_user_data(id, email, fname, lname, dob))
            },
        },
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            // Initialize the database.
            database::api::init();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![new_transaction, get_transactions, fix_transaction, remove_transaction, new_account, get_accounts, fix_account, remove_account, login, register, fix_user])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
