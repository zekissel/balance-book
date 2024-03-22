use std::fs;
use std::path::Path;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{ embed_migrations, EmbeddedMigrations, MigrationHarness };

use super::models::{ Account, AddAccount, AddTransaction, AddUser, Transaction, User };


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
/* CRUD for Transactions (negative amount for expense, positive for income) */
pub fn create_transaction(
  company: &str, 
  amount: i32,
  category: &str,
  date: &str,
  desc: &str,
  account_id: i32,
  secondary_id: Option<i32>
) -> Transaction {
  use super::schema::transaction;
  let new_transaction = AddTransaction { company, amount, category, date, desc, account_id, secondary_id };

  diesel::insert_into(transaction::table)
    .values(&new_transaction)
    .returning(Transaction::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error saving new transaction")
}

pub fn read_transaction(account_id_i: Vec<i32>) -> Vec<Transaction> {
  use super::schema::transaction::dsl::*;

  let mut ret = Vec::new();
  for a_id in account_id_i {
    let trans = transaction
      .filter(account_id.eq(a_id))
      .load::<Transaction>(&mut establish_connection())
      .expect("Error loading transactions");
    for t in trans { ret.push(t); }
  }
  ret
}

pub fn update_transaction(
  id_i: i32,
  company_i: &str, 
  amount_i: i32,
  category_i: &str,
  date_i: &str,
  desc_i: &str,
  account_id_i: i32,
  secondary_id_i: Option<i32>
) -> Transaction {
  use super::schema::transaction::dsl::*;

  diesel::update(transaction.find(id_i))
    .set((company.eq(company_i), amount.eq(amount_i), category.eq(category_i), date.eq(date_i), desc.eq(desc_i), account_id.eq(account_id_i), secondary_id.eq(secondary_id_i)))
    .returning(Transaction::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error updating transaction")
}

pub fn delete_transaction(id_i: i32) {
  use super::schema::transaction::dsl::*;

  diesel::delete(transaction.find(id_i))
    .execute(&mut establish_connection())
    .expect("Error deleting transaction");
}

/* CRUD for Accounts */
pub fn create_account(
  user_id: i32,
  account_type: &str, 
  account_name: &str, 
  balance: i32,
  date: &str
) -> Account {
  use super::schema::account;
  let new_account = AddAccount { user_id, account_type, account_name, balance, date };

  diesel::insert_into(account::table)
    .values(&new_account)
    .returning(Account::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error saving new account")
}

pub fn read_account(user_id_i: i32) -> Vec<Account> {
  use super::schema::account::dsl::*;

  account
    .filter(user_id.eq(user_id_i))
    .load::<Account>(&mut establish_connection())
    .expect("Error loading accounts")
}

pub fn update_account(
  id_i: i32,
  account_type_i: &str, 
  account_name_i: &str, 
  balance_i: i32,
  date_i: &str
) -> Account {
  use super::schema::account::dsl::*;

  diesel::update(account.find(id_i))
    .set((account_type.eq(account_type_i), account_name.eq(account_name_i), balance.eq(balance_i), date.eq(date_i)))
    .returning(Account::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error updating account")
}

pub fn delete_account(id_i: i32) {
  use super::schema::account::dsl::*;

  diesel::delete(account.find(id_i))
    .execute(&mut establish_connection())
    .expect("Error deleting account");
}


/* CRUD for Users */
pub fn create_user(
  name: &str, 
  password: &str,
  email: Option<&str>,
) -> User {
  use super::schema::user;
  let new_user = AddUser { name, password, email };

  diesel::insert_into(user::table)
    .values(&new_user)
    .returning(User::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error saving new user")
}

pub fn read_user() -> Vec<User> {
  use super::schema::user::dsl::*;

  user
    .load::<User>(&mut establish_connection())
    .expect("Error loading user")
}

pub fn update_user(
  id_i: i32,
  name_i: &str,
  password_i: &str,
  email_i: &str,
) -> User {
  use super::schema::user::dsl::*;

  diesel::update(user.find(id_i))
    .set((name.eq(name_i), password.eq(password_i), email.eq(email_i)))
    .returning(User::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error updating user")
}

pub fn delete_user(id_i: i32) {
  use super::schema::user::dsl::*;

  diesel::delete(user.find(id_i))
    .execute(&mut establish_connection())
    .expect("Error deleting user");
}


pub fn verify_user (name_i: &str, password_i: &str) -> Option<User> {
  use super::schema::user::dsl::*;

  let user_o = user
    .filter(name.eq(name_i))
    .filter(password.eq(password_i))
    .first::<User>(&mut establish_connection())
    .ok();

  user_o
}