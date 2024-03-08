// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use database::models::Expense;
use database::models::Income;

pub mod database;


#[tauri::command]
fn add_expense(store: &str, amount: i32, category: &str, desc: &str, date: &str) -> Expense {
    database::api::create_expense(store, amount, category, desc, date)
}

#[tauri::command]
fn load_expenses() -> Vec<Expense> {
    database::api::get_expenses()
}

#[tauri::command]
fn add_income(source: &str, amount: i32, category: &str, desc: &str, date: &str) -> Income {
    database::api::create_income(source, amount, category, desc, date)
}

#[tauri::command]
fn load_income() -> Vec<Income> {
    database::api::get_income()
}

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            // Initialize the database.
            database::api::init();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![add_expense, load_expenses, add_income, load_income])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
