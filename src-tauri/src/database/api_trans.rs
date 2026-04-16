use serde::Deserialize;
use diesel::prelude::*;
use diesel::sqlite::Sqlite;
use diesel::sql_types::{Text, Integer};
use diesel::internal::table_macro::{BoxedSelectStatement, FromClause};

use super::api::establish_connection;
use super::models::{ Transaction, AddTransaction, UpdateTransaction };


#[derive(Deserialize)]
pub struct Index {
  current_page: i32,
  page_size: i8,
  sort_field: String,
  sort_asc: bool,
}

#[derive(Deserialize, Clone)]
pub struct Filters {
  type_: Option<i8>, // "income", "expense", "transfer"
  start_date: Option<String>,
  end_date: Option<String>,
  store: Vec<String>,
  category: Vec<String>,
  low_amount: i32,
  high_amount: i32,
  account: Vec<String>,
}


/* Transaction CRUD */
#[tauri::command(rename_all = "snake_case")]
pub async fn create_transaction(
  app_handle: tauri::AppHandle,
  id_i: Option<&str>,
  amount: i32,
  timestamp: &str,
  store: &str, 
  category: &str,
  description: &str,
  account_id: &str,
) -> Result<Option<Transaction>, String> {
  use super::schema::transactions;

  let id = match id_i {
    Some(i) => i.to_string(),
    None => uuid::Uuid::new_v4().to_string(),
  };
  let new_trans = AddTransaction { 
    id: &id, amount, timestamp,
    store, category, description, account_id,
  };
  let trans = diesel::insert_into(transactions::table)
    .values(&new_trans)
    .returning(Transaction::as_returning())
    .get_result(&mut establish_connection(app_handle.clone()))
    .expect("error saving new transaction");

  Ok(Some(trans))
}


#[tauri::command(rename_all = "snake_case")]
pub async fn read_transactions(
  app_handle: tauri::AppHandle, 
  account_id_i: Vec<&str>
) -> Result<Vec<Transaction>, String> {
  use super::schema::transactions::dsl::*;

  if account_id_i.is_empty() {
    return Ok(vec![]); // Return an empty vector if no account IDs are provided
  }

  Ok(transactions
    .filter(account_id.eq_any(account_id_i))
    .load::<Transaction>(&mut establish_connection(app_handle))
    .expect("error loading transactions"))
}

async fn construct_trans_query(
  user_accounts: Vec<String>, 
  filters: Filters
) -> BoxedSelectStatement<'static, (Text, Integer, Text, Text, Text, Text, Text), FromClause<super::schema::transactions::table>, Sqlite, ()> 
{
  use super::schema::transactions;
  use super::schema::transactions::dsl::*;

  let exclude_accounts = filters.account.contains(&"X".to_owned());
  let exclude_stores = filters.store.contains(&"X".to_owned());
  let exclude_categories = filters.category.contains(&"X".to_owned());

  let mut query = transactions::table.into_boxed();
  query = query.filter(account_id.eq_any(user_accounts));

  if filters.start_date.is_some() {
    query = query.filter(timestamp.ge(filters.start_date.unwrap()));
  }
  if filters.end_date.is_some() {
    query = query.filter(timestamp.le(filters.end_date.unwrap()));
  }

  if exclude_accounts {
    query = query.filter(account_id.ne_all(filters.account));
  } else if filters.account.len() > 0 {
    query = query.filter(account_id.eq_any(filters.account));
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
  mut query: BoxedSelectStatement<'static, (Text, Integer, Text, Text, Text, Text, Text), FromClause<super::schema::transactions::table>, Sqlite, ()>,
  index: Index,
) -> BoxedSelectStatement<'static, (Text, Integer, Text, Text, Text, Text, Text), FromClause<super::schema::transactions::table>, Sqlite> {
  use super::schema::transactions::dsl::*;

  query = match index.sort_asc {
    true => match index.sort_field.as_str() {
      "store" => query.order(store.desc()),
      "account" => query.order(account_id.asc()),
      "amount" => query.order(amount.asc()),
      "category" => query.order(category.desc()),
      "date" => query.order(timestamp.asc()),
      "type" => query.order(category.desc()).then_order_by(amount.asc()),
      _ => query,
    },
    false => match index.sort_field.as_str() {
      "store" => query.order(store.asc()),
      "account" => query.order(account_id.desc()),
      "amount" => query.order(amount.desc()),
      "category" => query.order(category.asc()),
      "date" => query.order(timestamp.desc()),
      "type" => query.order(category.asc()).then_order_by(amount.desc()),
      _ => query,
    },
  };

  query = query.limit(index.page_size as i64);

  query = query.offset((index.current_page - 1) as i64 * index.page_size as i64);
  
  query
}

pub async fn read_trans_by_id(app_handle: tauri::AppHandle, t_id: &str) -> Option<Transaction> {
  use super::schema::transactions::dsl::*;

  transactions
    .filter(id.eq(t_id))
    .first::<Transaction>(&mut establish_connection(app_handle))
    .ok()
}

pub async fn read_trans(
  app_handle: tauri::AppHandle,
  user_accounts: Vec<String>,
  filters: Filters,
  index: Option<Index>,
) -> Option<Vec<Transaction>> {

  let mut query = construct_trans_query(user_accounts, filters).await;

  if index.is_some() {
    query = sort_query(query, index.unwrap()).await;
  }

  Some(query
    .load::<Transaction>(&mut establish_connection(app_handle))
    .expect("Error loading transactions"))
}



/* account_id and id provided to double check */
#[tauri::command(rename_all = "snake_case")]
pub async fn update_transaction(
  app_handle: tauri::AppHandle, 
  id_i: &str,
  new_amount: Option<i32>,
  new_timestamp: Option<&str>,
  new_store: Option<&str>, 
  new_category: Option<&str>,
  new_description: Option<&str>,
  account_id_i: &str,
) -> Result<Transaction, String> {
  use super::schema::transactions::dsl::*;

  diesel::update(transactions.filter(id.eq(id_i)))
    .set(&UpdateTransaction {
      id: id_i,
      amount: new_amount,
      timestamp: new_timestamp,
      store: new_store,
      category: new_category,
      description: new_description,
      account_id: account_id_i, //maybe set None, depending if transactions can change accts
    })
    .returning(Transaction::as_returning())
    .get_result(&mut establish_connection(app_handle))
    .map_err(|_| "error updating transaction".to_string())
}


#[tauri::command(rename_all = "snake_case")]
pub async fn delete_transaction(
  app_handle: tauri::AppHandle, 
  id_i: &str
) -> Result<usize, String> {
  use super::schema::transactions::dsl::*;

  diesel::delete(transactions.filter(id.eq(id_i)))
    .execute(&mut establish_connection(app_handle))
    .map_err(|_| "error deleting transaction".to_string())
}