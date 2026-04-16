use diesel::prelude::*;
use serde::Serialize;
use serde::ser::SerializeStruct;

use super::schema::transactions;
use super::schema::accounts;
use super::schema::users;
use super::schema::tokens;


#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::database::schema::transactions)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Transaction {
    pub id: String,
    pub amount: i32,
    pub timestamp: String,
    pub store: String,
    pub category: String,
    pub description: String,
    pub account_id: String,
}

#[derive(Insertable)]
#[diesel(table_name = transactions)]
pub struct AddTransaction<'a> {
    pub id: &'a str,
    pub amount: i32,
    pub timestamp: &'a str,
    pub store: &'a str,
    pub category: &'a str,
    pub description: &'a str,
    pub account_id: &'a str,
}

#[derive(AsChangeset)]
#[diesel(table_name = transactions)]
pub struct UpdateTransaction<'a> {
    pub id: &'a str,
    pub amount: Option<i32>,
    pub timestamp: Option<&'a str>,
    pub store: Option<&'a str>,
    pub category: Option<&'a str>,
    pub description: Option<&'a str>,
    pub account_id: &'a str,
}

impl Serialize for Transaction {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Transaction", 7)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("amount", &self.amount)?;
        state.serialize_field("timestamp", &self.timestamp)?;
        state.serialize_field("store", &self.store)?;
        state.serialize_field("category", &self.category)?;
        state.serialize_field("description", &self.description)?;
        state.serialize_field("account_id", &self.account_id)?;
        state.end()
    }
}




#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::database::schema::accounts)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Account {
    pub id: String,
    pub balance: i32,
    pub timestamp: String,
    pub name: String,
    pub category: String,
    pub user_id: String,
}

#[derive(Insertable)]
#[diesel(table_name = accounts)]
pub struct AddAccount<'a> {
    pub id: &'a str,
    pub balance: i32,
    pub timestamp: &'a str,
    pub name: &'a str,
    pub category: &'a str,
    pub user_id: &'a str,
}

#[derive(AsChangeset)]
#[diesel(table_name = accounts)]
pub struct UpdateAccount<'a> {
    pub id: &'a str,
    pub balance: Option<i32>,
    pub timestamp: Option<&'a str>,
    pub name: Option<&'a str>,
    pub category: Option<&'a str>,
    pub user_id: &'a str,
}

impl Serialize for Account {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where S: serde::Serializer,
  {
    let mut state = serializer.serialize_struct("Account", 6)?;
    state.serialize_field("id", &self.id)?;
    state.serialize_field("balance", &self.balance)?;
    state.serialize_field("timestamp", &self.timestamp)?;
    state.serialize_field("name", &self.name)?;
    state.serialize_field("category", &self.category)?;
    state.serialize_field("user_id", &self.user_id)?;
    state.end()
  }
}


#[derive(Queryable, Selectable, Clone)]
#[diesel(table_name = crate::database::schema::users)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct User {
    pub id: String,
    pub name: String,
}

#[derive(Insertable)]
#[diesel(table_name = users)]
pub struct AddUser<'a> {
  pub id: &'a str,
  pub name: &'a str,
}

impl Serialize for User {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where S: serde::Serializer,
  {
    let mut state = serializer.serialize_struct("User", 3)?;
    state.serialize_field("id", &self.id)?;
    state.serialize_field("name", &self.name)?;
    state.end()
  }
}


#[derive(Queryable, Selectable, Clone)]
#[diesel(table_name = crate::database::schema::tokens)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Token {
    pub id: String,
    pub user_id: String,
    pub cursor: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = tokens)]
pub struct AddToken<'a> {
  pub id: &'a str,
  pub user_id: &'a str,
}

impl Serialize for Token {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where S: serde::Serializer,
  {
    let mut state = serializer.serialize_struct("Token", 3)?;
    state.serialize_field("id", &self.id)?;
    state.serialize_field("user_id", &self.user_id)?;
    state.serialize_field("cursor", &self.cursor)?;
    state.end()
  }
}