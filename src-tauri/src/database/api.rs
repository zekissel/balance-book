use std::fs;
use std::path::Path;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{ embed_migrations, EmbeddedMigrations, MigrationHarness };

use super::models::{ Account, AddAccount, AddTransaction, AddUser, Transaction, User, Token, AddToken };

use argon2::{
  password_hash::{
      rand_core::OsRng,
      PasswordHash, PasswordHasher, PasswordVerifier, SaltString
  },
  Argon2
};


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
#[allow(unused_assignments)]
pub async fn create_transaction(
  id: Option<&str>,
  company: &str, 
  amount: i32,
  category: &str,
  date: &str,
  desc: &str,
  account_id: &str,
) -> Transaction {
  use super::schema::transaction;
  let mut trans_id = String::new();
  match id {
    Some(id) => trans_id = id.to_string(),
    None => trans_id = uuid::Uuid::new_v4().to_string(),
  }
  let new_transaction = AddTransaction { id: &trans_id, company, amount, category, date, desc, account_id };

  diesel::insert_into(transaction::table)
    .values(&new_transaction)
    .returning(Transaction::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error saving new transaction")
}

pub async fn read_transaction(account_id_i: Vec<&str>) -> Vec<Transaction> {
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

pub async fn read_transaction_by_id(id_i: &str) -> Option<Transaction> {
  use super::schema::transaction::dsl::*;

  transaction
    .filter(id.eq(id_i))
    .first::<Transaction>(&mut establish_connection())
    .ok()
}

pub async fn update_transaction(
  id_i: &str,
  company_i: &str, 
  amount_i: i32,
  category_i: &str,
  date_i: &str,
  desc_i: &str,
  account_id_i: &str,
) -> Transaction {
  use super::schema::transaction::dsl::*;

  diesel::update(transaction.find(id_i))
    .set((company.eq(company_i), amount.eq(amount_i), category.eq(category_i), date.eq(date_i), desc.eq(desc_i), account_id.eq(account_id_i)))
    .returning(Transaction::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error updating transaction")
}

pub fn delete_transaction(id_i: &str) {
  use super::schema::transaction::dsl::*;

  diesel::delete(transaction.find(id_i))
    .execute(&mut establish_connection())
    .expect("Error deleting transaction");
}

/* CRUD for Accounts */
#[allow(unused_assignments)]
pub async fn create_account(
  id: Option<&str>,
  user_id: &str,
  account_type: &str, 
  account_name: &str, 
  balance: i32,
  date: &str
) -> Account {
  use super::schema::account;
  let mut account_id = String::new();
  match id {
    Some(id) => account_id = id.to_string(),
    None => account_id = uuid::Uuid::new_v4().to_string(),
  }
  let new_account = AddAccount { id: &account_id, user_id, account_type, account_name, balance, date };

  diesel::insert_into(account::table)
    .values(&new_account)
    .returning(Account::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error saving new account")
}

pub async fn read_account(user_id_i: &str) -> Vec<Account> {
  use super::schema::account::dsl::*;

  account
    .filter(user_id.eq(user_id_i))
    .load::<Account>(&mut establish_connection())
    .expect("Error loading accounts")
}

pub async fn read_account_by_id(id_i: &str) -> Option<Account> {
  use super::schema::account::dsl::*;

  account
    .filter(id.eq(id_i))
    .first::<Account>(&mut establish_connection())
    .ok()
}

pub async fn update_account(
  id_i: &str,
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

pub async fn update_account_balance(
  id_i: &str, 
  balance_i: i32, 
  date_i: &str
) -> Account {
  use super::schema::account::dsl::*;

  diesel::update(account.find(id_i))
    .set((balance.eq(balance_i), date.eq(date_i)))
    .returning(Account::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error updating account balance")
}

pub fn delete_account(id_i: &str) {
  use super::schema::account::dsl::*;

  diesel::delete(account.find(id_i))
    .execute(&mut establish_connection())
    .expect("Error deleting account");
}


/* CRUD for Users */
pub async fn create_user(
  uname: &str, 
  password: &str,
) -> Option<User> {
  use super::schema::user;
  // if user name exists, return
  match read_user_by_uname(uname).await {
    Some(_) => return None,
    None => (),
  };

  let pwsalt = SaltString::generate(&mut OsRng);
  let argon2 = Argon2::default();
  // Hash password to PHC string ($argon2id$v=19$...)
  let password_hash = argon2.hash_password(password.as_bytes(), &pwsalt).unwrap().to_string();
  let pwhash = PasswordHash::new(&password_hash).unwrap();
  assert!(Argon2::default().verify_password(password.as_bytes(), &pwhash).is_ok());

  let new_user = AddUser { id: &uuid::Uuid::new_v4().to_string(), uname, pwhash: &pwhash.to_string(), pwsalt: &pwsalt.to_string(), email: None, fname: None, lname: None, dob: None };
  Some(diesel::insert_into(user::table)
    .values(&new_user)
    .returning(User::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error saving new user"))
}

pub async fn read_user_by_uname(name_i: &str) -> Option<User> {
  use super::schema::user::dsl::*;

  user
    .filter(uname.eq(name_i))
    .first::<User>(&mut establish_connection())
    .ok()
}

pub async fn read_user_by_email(email_i: &str) -> Option<User> {
  use super::schema::user::dsl::*;

  user
    .filter(email.eq(email_i))
    .first::<User>(&mut establish_connection())
    .ok()
}

pub async fn read_user_by_id(id_i: &str) -> Option<User> {
  use super::schema::user::dsl::*;

  user
    .filter(id.eq(id_i))
    .first::<User>(&mut establish_connection())
    .ok()
}

pub async fn update_user_password(id_i: &str, password_i: &str) -> User {
  use super::schema::user::dsl::*;

  let pwsalt_i = SaltString::generate(&mut OsRng);
  let password_hash = Argon2::default().hash_password(password_i.as_bytes(), &pwsalt_i).unwrap().to_string();
  let pwhash_i = PasswordHash::new(&password_hash).unwrap();
  assert!(Argon2::default().verify_password(password_i.as_bytes(), &pwhash_i).is_ok());

  diesel::update(user.find(id_i))
    .set((pwhash.eq(pwhash_i.to_string()), pwsalt.eq(pwsalt_i.to_string())))
    .returning(User::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error updating user password")
}

pub async fn update_user_data(id_i: &str, email_i: Option<&str>, fname_i: Option<&str>, lname_i: Option<&str>, dob_i: Option<&str>) -> Option<User> {
  use super::schema::user::dsl::*;

  Some(diesel::update(user.find(id_i))
    .set((email.eq(email_i), fname.eq(fname_i), lname.eq(lname_i), dob.eq(dob_i)))
    .returning(User::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error updating user data"))
}

pub fn delete_user(id_i: &str) {
  use super::schema::user::dsl::*;

  diesel::delete(user.find(id_i))
    .execute(&mut establish_connection())
    .expect("Error deleting user");
}


pub async fn verify_user(name_i: &str, password_i: &str) -> Option<User> {
  use super::schema::user::dsl::*;

  let user_data = match read_user_by_uname(name_i).await {
    Some(user_result) => user_result,
    None => return None,
  };

  let pwsalt_i = SaltString::from_b64(&user_data.pwsalt).unwrap();
  // Hash password to PHC string ($argon2id$v=19$...)
  let password_hash = Argon2::default().hash_password(password_i.as_bytes(), &pwsalt_i).unwrap().to_string();
  let pwhash_i = PasswordHash::new(&password_hash).unwrap();
  assert!(Argon2::default().verify_password(password_i.as_bytes(), &pwhash_i).is_ok());

  let user_o = user
    .filter(uname.eq(name_i))
    .filter(pwhash.eq(pwhash_i.to_string()))
    .first::<User>(&mut establish_connection())
    .ok();

  user_o
}


pub async fn deposit_token(
  user_id: &str, 
  token_id: &str,
  item_id: &str,
) -> Option<Token> {
  use super::schema::token;

  let new_token = AddToken { id: token_id, user_id, item_id, cursor: None };
  Some(diesel::insert_into(token::table)
    .values(&new_token)
    .returning(Token::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error saving new token"))
}

pub async fn read_user_tokens(user_id_i: &str) -> Vec<Token> {
  use super::schema::token::dsl::*;

  token
    .filter(user_id.eq(user_id_i))
    .load::<Token>(&mut establish_connection())
    .expect("Error loading user access tokens")
}

pub async fn update_token_cursor(
  token_id_i: &str,
  cursor_i: &str,
) -> Token {
  use super::schema::token::dsl::*;

  diesel::update(token.find(token_id_i))
    .set(cursor.eq(cursor_i))
    .returning(Token::as_returning())
    .get_result(&mut establish_connection())
    .expect("Error updating token cursor")
}