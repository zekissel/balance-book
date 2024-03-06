// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use database::models::Expense;

pub mod database;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn add_expense(store: &str, amount: i32, category: &str, desc: &str, date: &str) -> Expense {
    database::api::create_expense(store, amount, category, desc, date)
}

#[tauri::command]
fn load_expenses() -> Vec<Expense> {
    database::api::get_expenses()
}

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            // Initialize the database.
            database::api::init();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, add_expense, load_expenses])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
