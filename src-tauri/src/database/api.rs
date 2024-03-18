use std::fs;
use std::path::Path;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

use super::models::{AddExpense, Expense, AddIncome, Income, AddAccount, Account, AddHistory, History};


/* ----- initialize database connection and migrations */
const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn init() {
  if !db_file_exists() {
    create_db_file();
  }

  run_migrations();
}

fn run_migrations() {
  let mut connection = establish_connection();
  connection.run_pending_migrations(MIGRATIONS).unwrap();
}

fn establish_connection() -> SqliteConnection {
  let db_path = "sqlite://".to_string() + get_db_path().as_str();

  SqliteConnection::establish(&db_path)
    .unwrap_or_else(|_| panic!("Error connecting to {}", db_path))
}

// Create the database file.
fn create_db_file() {
  let db_path = get_db_path();
  let db_dir = Path::new(&db_path).parent().unwrap();

  // If the parent directory does not exist, create it.
  if !db_dir.exists() {
    fs::create_dir_all(db_dir).unwrap();
  }

  // Create the database file.
  fs::File::create(db_path).unwrap();
}

// Check whether the database file exists.
fn db_file_exists() -> bool {
  let db_path = get_db_path();
  Path::new(&db_path).exists()
}

// Get the path where the database file should be located.
fn get_db_path() -> String {
  let home_dir = homedir::get_my_home().unwrap().unwrap();
  home_dir.to_str().unwrap().to_string() + "/.config/records/db.sqlite"
}

/* --------- Interacting with database --------- */
pub fn create_expense(
  store: &str, 
  amount: i32,
  category: &str,
  desc: &str,
  date: &str,
  src_account_id: &str
) -> Expense {
  use super::schema::expense;
  let connection = &mut establish_connection();

  let new_expense = AddExpense { store, amount, category, desc, date, src_account_id };

  diesel::insert_into(expense::table)
    .values(&new_expense)
    .returning(Expense::as_returning())
    .get_result(connection)
    .expect("Error saving new expense")
}

pub fn get_expenses() -> Vec<Expense> {
  use super::schema::expense::dsl::*;

  expense
    .load::<Expense>(&mut establish_connection())
    .expect("Error loading expenses")
}

pub fn update_expense(
  id_i: i32,
  store_i: &str, 
  amount_i: i32,
  category_i: &str,
  desc_i: &str,
  date_i: &str,
  src_account_id_i: &str
) -> Expense {
  use super::schema::expense::dsl::*;

  let connection = &mut establish_connection();

  diesel::update(expense.find(id_i))
    .set((store.eq(store_i), amount.eq(amount_i), category.eq(category_i), desc.eq(desc_i), date.eq(date_i), src_account_id.eq(src_account_id_i)))
    .returning(Expense::as_returning())
    .get_result(connection)
    .expect("Error updating expense")
}

pub fn delete_expense(id_i: i32) {
  use super::schema::expense::dsl::*;

  let connection = &mut establish_connection();

  diesel::delete(expense.find(id_i))
    .execute(connection)
    .expect("Error deleting expense");
}



pub fn create_income(
  source: &str, 
  amount: i32,
  category: &str,
  desc: &str,
  date: &str,
  dest_account_id: &str
) -> Income {
  use super::schema::income;
  let connection = &mut establish_connection();

  let new_income = AddIncome { source, amount, category, desc, date, dest_account_id };

  diesel::insert_into(income::table)
    .values(&new_income)
    .returning(Income::as_returning())
    .get_result(connection)
    .expect("Error saving new income")
}

pub fn get_income() -> Vec<Income> {
  use super::schema::income::dsl::*;

  income
    .load::<Income>(&mut establish_connection())
    .expect("Error loading income")
}

pub fn update_income(
  id_i: i32,
  source_i: &str, 
  amount_i: i32,
  category_i: &str,
  desc_i: &str,
  date_i: &str,
  dest_account_id_i: &str
) -> Income {
  use super::schema::income::dsl::*;

  let connection = &mut establish_connection();

  diesel::update(income.find(id_i))
    .set((source.eq(source_i), amount.eq(amount_i), category.eq(category_i), desc.eq(desc_i), date.eq(date_i), dest_account_id.eq(dest_account_id_i)))
    .returning(Income::as_returning())
    .get_result(connection)
    .expect("Error updating income")
}

pub fn delete_income(id_i: i32) {
  use super::schema::income::dsl::*;

  let connection = &mut establish_connection();

  diesel::delete(income.find(id_i))
    .execute(connection)
    .expect("Error deleting income");
}


pub fn create_account(
  account_type: &str, 
  account_id: &str, 
  balance: i32,
  date: &str
) -> Account {
  use super::schema::account;
  let connection = &mut establish_connection();

  let new_account = AddAccount { account_type, account_id, balance, date };

  diesel::insert_into(account::table)
    .values(&new_account)
    .returning(Account::as_returning())
    .get_result(connection)
    .expect("Error saving new account")
}

pub fn get_account() -> Vec<Account> {
  use super::schema::account::dsl::*;

  account
    .load::<Account>(&mut establish_connection())
    .expect("Error loading account")
}

pub fn update_account(
  id_i: i32,
  account_type_i: &str, 
  account_id_i: &str, 
  balance_i: i32,
  date_i: &str
) -> Account {
  use super::schema::account::dsl::*;

  let connection = &mut establish_connection();

  diesel::update(account.find(id_i))
    .set((account_type.eq(account_type_i), account_id.eq(account_id_i), balance.eq(balance_i), date.eq(date_i)))
    .returning(Account::as_returning())
    .get_result(connection)
    .expect("Error updating account")
}

pub fn delete_account(id_i: i32) {
  use super::schema::account::dsl::*;

  let connection = &mut establish_connection();

  diesel::delete(account.find(id_i))
    .execute(connection)
    .expect("Error deleting account");
}



pub fn create_history(
  id: i32, 
  balance: i32,
  date: &str
) -> History {
  use super::schema::history;
  let connection = &mut establish_connection();

  let new_history = AddHistory { id, balance, date };

  diesel::insert_into(history::table)
    .values(&new_history)
    .returning(History::as_returning())
    .get_result(connection)
    .expect("Error saving new history")
}

pub fn get_history() -> Vec<History> {
  use super::schema::history::dsl::*;

  history
    .load::<History>(&mut establish_connection())
    .expect("Error loading history")
}

pub fn update_history(
  id_i: i32,
  balance_i: i32,
  date_i: &str
) -> History {
  use super::schema::history::dsl::*;

  let connection = &mut establish_connection();

  diesel::update(history.find(date_i))
    .set((balance.eq(balance_i), id.eq(id_i)))
    .returning(History::as_returning())
    .get_result(connection)
    .expect("Error updating history")
}

pub fn delete_history(date_i: &str) {
  use super::schema::history::dsl::*;

  let connection = &mut establish_connection();

  diesel::delete(history.find(date_i))
    .execute(connection)
    .expect("Error deleting history");
}