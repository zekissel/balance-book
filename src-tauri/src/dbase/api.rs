use std::fs;
use std::path::Path;

use diesel::prelude::*;
use diesel::sqlite::{SqliteConnection, Sqlite};
use diesel::sql_types::{Text, Integer};
use diesel::internal::table_macro::{BoxedSelectStatement, FromClause};
use diesel_migrations::{ embed_migrations, EmbeddedMigrations, MigrationHarness };

use crate::Filters;

use super::models::{ Account, AddAccount, Trans, AddTrans, User, AddUser };

/* 
use argon2::{
  password_hash::{
    rand_core::OsRng, PasswordHash, 
    PasswordHasher, PasswordVerifier, SaltString
  }, Argon2
};*/

/* ----- initialize database connection and migrate schema ----- */
const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

fn get_db_path(app_handle: tauri::AppHandle) -> String {
  let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
  app_dir.to_str().unwrap().to_string() + "/archive/db.sqlite"
}

fn establish_connection(app_handle: tauri::AppHandle) -> SqliteConnection {
  let db_path = "sqlite://".to_string() + get_db_path(app_handle).as_str();

  SqliteConnection::establish(&db_path)
    .unwrap_or_else(|_| panic!("Error connecting to {}", db_path))
}

pub fn init(app_handle: tauri::AppHandle) {

  fn db_file_exists(app_handle: tauri::AppHandle) -> bool {
    let db_path = get_db_path(app_handle);
    Path::new(&db_path).exists()
  }

  fn create_db_file(app_handle: tauri::AppHandle) {
    let db_path = get_db_path(app_handle);
    let db_dir = Path::new(&db_path).parent().unwrap();
    // If the parent directory does not exist, create it.
    if !db_dir.exists() {
      fs::create_dir_all(db_dir).unwrap();
    }
    fs::File::create(db_path).unwrap();
  }

  if !db_file_exists(app_handle.clone()) { create_db_file(app_handle.clone()); }

  let mut connection = establish_connection(app_handle);
  connection.run_pending_migrations(MIGRATIONS).unwrap();
}/**/


/* --------- Interacting with database --------- */
/* CRUD for Transactions (negative amount for expense, positive for income) */
pub async fn create_trans(
  app_handle: tauri::AppHandle,
  id_i: Option<&str>,
  store: &str, 
  amount: i32,
  category: &str,
  date: &str,
  desc: &str,
  account_id: &str,
) -> Option<Trans> {
  use super::schema::trans;

  let id = match id_i {
    Some(i) => i.to_string(),
    None => uuid::Uuid::new_v4().to_string(),
  };
  let new_trans = AddTrans { id: &id, store, amount, category, date, desc, account_id };

  diesel::insert_into(trans::table)
    .values(new_trans)
    .returning(Trans::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .ok()
}

async fn construct_trans_query(filters: Filters) -> BoxedSelectStatement<'static, (Text, Text, Integer, Text, Text, Text, Text), FromClause<super::schema::trans::table>, Sqlite, ()> {
  use super::schema::trans;
  use super::schema::trans::dsl::*;

  let accts = filters.account.clone();
  let exclude_accounts = filters.account.contains(&"X".to_owned());
  let exclude_stores = filters.store.contains(&"X".to_owned());
  let exclude_categories = filters.category.contains(&"X".to_owned());

  let mut query = trans::table.into_boxed();
  if filters.start_date.is_some() {
    query = query.filter(date.ge(filters.start_date.unwrap()));
  }
  if filters.end_date.is_some() {
    query = query.filter(date.le(filters.end_date.unwrap()));
  }

  if exclude_accounts {
    query = query.filter(account_id.ne_all(accts));
  } else if accts.len() > 0 {
    query = query.filter(account_id.eq_any(accts));
  }

  if exclude_stores {
    query = query.filter(store.ne_all(filters.store));
  } else if filters.store.len() > 0 {
    query = query.filter(store.eq_any(filters.store));
  }

  if exclude_categories {
    query = query.filter(category.ne_all(filters.category));
  } else if filters.category.len() > 0 {
    query = query.filter(category.eq_any(filters.category));
  }

  if filters.low_amount > 0 {
    let low_amount = filters.low_amount - 1;
    query = query.filter(amount.not_between(-low_amount, low_amount));
  }
  if filters.high_amount > 0 {
    query = query.filter(amount.between(-filters.high_amount, filters.high_amount));
  }
  

  match filters.type_ {
    Some(-1) => query = query.filter(amount.lt(0)).filter(category.ne_all(vec!["Financial>Transfer", "FinanceIncome>Transfer", "Financial>Credit", "FinanceIncome>Credit"])),
    Some(1) => query = query.filter(amount.gt(0)).filter(category.ne_all(vec!["Financial>Transfer", "FinanceIncome>Transfer", "Financial>Credit", "FinanceIncome>Credit"])),
    Some(0) => query = query.filter(category.eq_any(vec!["Financial>Transfer", "FinanceIncome>Transfer", "Financial>Credit", "FinanceIncome>Credit"])),
    _ => (),
  }

  query
}

async fn sort_query(
  mut query: BoxedSelectStatement<'static, (Text, Text, Integer, Text, Text, Text, Text), FromClause<super::schema::trans::table>, Sqlite, ()>,
  index: crate::Index,
) -> BoxedSelectStatement<'_, (Text, Text, Integer, Text, Text, Text, Text), FromClause<super::schema::trans::table>, Sqlite> {
  use super::schema::trans::dsl::*;

  query = match index.sort_asc {
    true => match index.sort_field.as_str() {
      "store" => query.order(store.desc()),
      "account" => query.order(account_id.asc()),
      "amount" => query.order(amount.asc()),
      "category" => query.order(category.desc()),
      "date" => query.order(date.asc()),
      "type" => query.order(category.desc()).then_order_by(amount.asc()),
      _ => query,
    },
    false => match index.sort_field.as_str() {
      "store" => query.order(store.asc()),
      "account" => query.order(account_id.desc()),
      "amount" => query.order(amount.desc()),
      "category" => query.order(category.asc()),
      "date" => query.order(date.desc()),
      "type" => query.order(category.asc()).then_order_by(amount.desc()),
      _ => query,
    },
  };

  query = query.limit(index.page_size as i64);

  query = query.offset((index.current_page - 1) as i64 * index.page_size as i64);
  
  query
}

pub async fn read_trans(
  app_handle: tauri::AppHandle,
  filters: Filters,
  index: Option<crate::Index>,
) -> Option<Vec<Trans>> {

  let mut query = construct_trans_query(filters).await;

  if index.is_some() {
    query = sort_query(query, index.unwrap()).await;
  }

  Some(query
    .load::<Trans>(&mut establish_connection(app_handle))
    .expect("Error loading transactions"))
}

pub async fn count_trans(
  app_handle: tauri::AppHandle,
  filters: Filters,
) -> i64 {
  let query = construct_trans_query(filters).await;

  query
    .count()
    .get_result(&mut establish_connection(app_handle))
    .expect("Error counting transactions")
}


pub async fn update_trans_store(
  app_handle: tauri::AppHandle,
  id_i: &str,
  store_i: &str,
) -> Option<Trans> {
  use super::schema::trans::dsl::*;

  Some(diesel::update(trans.find(id_i))
    .set(store.eq(store_i))
    .returning(Trans::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .expect("Error updating transaction store"))
}

pub async fn update_trans_amount(
  app_handle: tauri::AppHandle,
  id_i: &str,
  amount_i: i32,
) -> Option<Trans> {
  use super::schema::trans::dsl::*;

  Some(diesel::update(trans.find(id_i))
    .set(amount.eq(amount_i))
    .returning(Trans::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .expect("Error updating transaction amount"))
}

pub async fn update_trans_category(
  app_handle: tauri::AppHandle,
  id_i: &str,
  category_i: &str,
) -> Option<Trans> {
  use super::schema::trans::dsl::*;

  Some(diesel::update(trans.find(id_i))
    .set(category.eq(category_i))
    .returning(Trans::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .expect("Error updating transaction category"))
}

pub async fn update_trans_date(
  app_handle: tauri::AppHandle,
  id_i: &str,
  date_i: &str,
) -> Option<Trans> {
  use super::schema::trans::dsl::*;

  Some(diesel::update(trans.find(id_i))
    .set(date.eq(date_i))
    .returning(Trans::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .expect("Error updating transaction date"))
}

pub async fn update_trans_desc(
  app_handle: tauri::AppHandle,
  id_i: &str,
  desc_i: &str,
) -> Option<Trans> {
  use super::schema::trans::dsl::*;

  Some(diesel::update(trans.find(id_i))
    .set(desc.eq(desc_i))
    .returning(Trans::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .expect("Error updating transaction desc"))
}

pub async fn update_trans_account(
  app_handle: tauri::AppHandle,
  id_i: &str,
  acc_id_i: &str,
) -> Option<Trans> {
  use super::schema::trans::dsl::*;

  Some(diesel::update(trans.find(id_i))
    .set(account_id.eq(acc_id_i))
    .returning(Trans::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .expect("Error updating transaction account"))
}

pub async fn delete_trans(app_handle: tauri::AppHandle, id_i: &str) {
  use super::schema::trans::dsl::*;

  diesel::delete(trans.find(id_i))
    .execute(&mut establish_connection(app_handle))
    .ok();
}

/* CRUD for Accounts */
#[allow(unused_assignments)]
pub async fn create_account(
  app_handle: tauri::AppHandle,
  id_i: Option<&str>,
  type_: &str, 
  name: &str, 
  balance: i32,
  date: &str,
  user_id: &str
) -> Option<Account> {
  use super::schema::account;

  let id = match id_i {
    Some(i) => i.to_string(),
    None => uuid::Uuid::new_v4().to_string(),
  };
  let new_account = AddAccount { id: &id, type_, name, balance, date, user_id };

  Some(diesel::insert_into(account::table)
    .values(&new_account)
    .returning(Account::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .expect("Error creating new account"))
}

pub async fn read_account(
  app_handle: tauri::AppHandle, 
  user_id_i: &str
) -> Option<Vec<Account>> {
  use super::schema::account::dsl::*;

  account
    .filter(user_id.eq(user_id_i))
    .load::<Account>(&mut establish_connection(app_handle))
    .ok()
}

pub async fn read_account_by_id(app_handle: tauri::AppHandle, id_i: &str) -> Option<Account> {
  use super::schema::account::dsl::*;

  account
    .filter(id.eq(id_i))
    .first::<Account>(&mut establish_connection(app_handle))
    .ok()
}

pub async fn update_account(
  app_handle: tauri::AppHandle,
  id_i: &str,
  name_i: &str, 
  type_i: &str, 
  balance_i: i32,
  date_i: &str
) -> Option<Account> {
  use super::schema::account::dsl::*;

  diesel::update(account.find(id_i))
    .set((type_.eq(type_i), name.eq(name_i), balance.eq(balance_i), date.eq(date_i)))
    .returning(Account::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .ok()
}

pub async fn update_account_balance(
  app_handle: tauri::AppHandle,
  id_i: &str, 
  balance_i: i32, 
  date_i: &str
) -> Option<Account> {
  use super::schema::account::dsl::*;

  diesel::update(account.find(id_i))
    .set((balance.eq(balance_i), date.eq(date_i)))
    .returning(Account::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .ok()
}

pub async fn delete_account(app_handle: tauri::AppHandle, id_i: &str) {
  use super::schema::account::dsl::*;
  use super::schema::trans::dsl::*;

  diesel::delete(trans.filter(account_id.eq(id_i)))
    .execute(&mut establish_connection(app_handle.clone()))
    .expect("Error deleting transactions associated with account");

  diesel::delete(account.find(id_i))
    .execute(&mut establish_connection(app_handle))
    .expect("Error deleting account");
}


/* CRUD for Users */
pub async fn create_user(
  app_handle: tauri::AppHandle,
  name: &str, 
  password: &str,
) -> Option<User> {
  use super::schema::user;
  use argon2::Config;
  use password_hash::{ rand_core::OsRng, SaltString};
  
  match read_user_by_name(app_handle.clone(), name).await {
    Some(_) => return None,
    None => (),
  };

  let salt = SaltString::generate(&mut OsRng);
  let config = Config::default();
  let hash = argon2::hash_encoded(password.as_bytes(), salt.to_string().as_bytes(), &config).unwrap();
  assert!(argon2::verify_encoded(&hash, password.as_bytes()).unwrap());

  //
  //let argon2 = Argon2::default();
  // Hash password to PHC string ($argon2id$v=19$...)
  //let hashed_pw = argon2.hash_password(password.as_bytes(), &pwsalt).unwrap().to_string();
  //let pwhash = PasswordHash::new(&hashed_pw).unwrap();
  //assert!(argon2.verify_password(password.as_bytes(), &pwhash).is_ok());

  let new_user = AddUser { id: &uuid::Uuid::new_v4().to_string(), name, pwhash: &hash.to_string(), salt: &salt.to_string() };
  let user = diesel::insert_into(user::table)
    .values(&new_user)
    .returning(User::as_returning())
    .get_result(&mut establish_connection(app_handle.clone()))
    .expect("Error saving new user");

  let _ = create_account(app_handle, None, "Checking", "Cash", 0, &chrono::Utc::now().to_string(), &user.id).await;

  Some(user)
}

async fn read_user_by_name(app_handle: tauri::AppHandle, name_i: &str) -> Option<User> {
  use super::schema::user::dsl::*;

  user
    .filter(name.eq(name_i))
    .first::<User>(&mut establish_connection(app_handle))
    .ok()
}

async fn read_user_by_email(app_handle: tauri::AppHandle, email_i: &str) -> Option<User> {
  use super::schema::user::dsl::*;

  user
    .filter(email.eq(email_i))
    .first::<User>(&mut establish_connection(app_handle))
    .ok()
}

pub async fn read_user_by_id(app_handle: tauri::AppHandle, id_i: &str) -> Option<User> {
  use super::schema::user::dsl::*;

  user
    .filter(id.eq(id_i))
    .first::<User>(&mut establish_connection(app_handle))
    .ok()
}

pub async fn update_user_password(
  app_handle: tauri::AppHandle,
  id_i: &str, 
  password_i: &str
) -> Option<User> {
  use super::schema::user::dsl::*;
  use argon2::Config;
  use password_hash::{ rand_core::OsRng, SaltString};

  let salt_i = SaltString::generate(&mut OsRng);
  let config = Config::default();
  let hash = argon2::hash_encoded(password_i.as_bytes(), salt_i.to_string().as_bytes(), &config).unwrap();
  assert!(argon2::verify_encoded(&hash, password_i.as_bytes()).unwrap());

  //let pwsalt_i = SaltString::generate(&mut OsRng);
  //let password_hash = Argon2::default().hash_password(password_i.as_bytes(), &pwsalt_i).unwrap().to_string();
  //let pwhash_i = PasswordHash::new(&password_hash).unwrap();
  //assert!(Argon2::default().verify_password(password_i.as_bytes(), &pwhash_i).is_ok());

  diesel::update(user.find(id_i))
    .set((pwhash.eq(hash.to_string()), salt.eq(salt_i.to_string())))
    .returning(User::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .ok()
}

pub async fn update_user_data(
  app_handle: tauri::AppHandle,
  id_i: &str, 
  name_i: Option<&str>, 
  email_i: Option<&str>
) -> Option<User> {
  use super::schema::user::dsl::*;

  match name_i {
    Some(_) => match read_user_by_name(app_handle.clone(), name_i.unwrap()).await {
      Some(_) => return None,
      None => (),
    },
    None => (),
  };

  match email_i {
    Some(_) => match read_user_by_email(app_handle.clone(), email_i.unwrap()).await {
      Some(_) => return None,
      None => (),
    },
    None => (),
  };

  diesel::update(user.find(id_i))
    .set((name.eq(name_i.unwrap()), email.eq(email_i.unwrap())))
    .returning(User::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .ok()
}

pub async fn delete_user(app_handle: tauri::AppHandle, id_i: &str) -> bool {
  use super::schema::user::dsl::*;
  use super::schema::trans::dsl::*;

  match read_account(app_handle.clone(), id_i).await {
    Some(accts) => {
      for acc in accts {
        diesel::delete(trans.filter(account_id.eq(&acc.id)))
          .execute(&mut establish_connection(app_handle.clone()))
          .ok();
        delete_account(app_handle.clone(), &acc.id).await;
      }
    },
    None => (),
  };

  diesel::delete(user.find(id_i))
    .execute(&mut establish_connection(app_handle))
    .expect("Error deleting user") > 0
}


pub async fn verify_user(
  app_handle: tauri::AppHandle, 
  name_i: &str, 
  password_i: &str
) -> Option<User> {
  use super::schema::user::dsl::*;
  use argon2::Config;
  use password_hash::SaltString;
  
  let user_cred = match read_user_by_name(app_handle.clone(), name_i).await {
    Some(result) => result,
    None => return None,
  };

  let salt_i = SaltString::from_b64(&user_cred.salt).unwrap();
  let config = Config::default();
  let hash = argon2::hash_encoded(password_i.as_bytes(), salt_i.to_string().as_bytes(), &config).unwrap();
  assert!(argon2::verify_encoded(&hash, password_i.as_bytes()).unwrap());

  //let pwsalt_i = SaltString::from_b64(&user_cred.salt).unwrap();
  //let hash_password = Argon2::default().hash_password(password_i.as_bytes(), &pwsalt_i).unwrap().to_string();
  //let pwhash_i = PasswordHash::new(&hash_password).unwrap();
  //assert!(Argon2::default().verify_password(password_i.as_bytes(), &pwhash_i).is_ok());

  let user_o = user
    .filter(name.eq(name_i))
    .filter(pwhash.eq(hash.to_string()))
    .first::<User>(&mut establish_connection(app_handle))
    .ok();

  user_o
}