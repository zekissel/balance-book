use diesel::prelude::*;
use serde::Serialize;
use serde::ser::SerializeStruct;

use super::schema::trans;
use super::schema::account;
use super::schema::user;
use super::schema::token;


#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::dbase::schema::trans)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Trans {
    pub id: String,
    pub store: String,
    pub amount: i32,
    pub category: String,
    pub date: String,
    pub desc: String,
    pub account_id: String,
}

#[derive(Insertable)]
#[diesel(table_name = trans)]
pub struct AddTrans<'a> {
    pub id: &'a str,
    pub store: &'a str,
    pub amount: i32,
    pub category: &'a str,
    pub date: &'a str,
    pub desc: &'a str,
    pub account_id: &'a str,
}

impl Serialize for Trans {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Trans", 7)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("store", &self.store)?;
        state.serialize_field("amount", &self.amount)?;
        state.serialize_field("category", &self.category)?;
        state.serialize_field("date", &self.date)?;
        state.serialize_field("desc", &self.desc)?;
        state.serialize_field("account_id", &self.account_id)?;
        state.end()
    }
}


#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::dbase::schema::account)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Account {
    pub id: String,
    pub name: String,
    pub type_: String,
    pub balance: i32,
    pub date: String,
    pub user_id: String,
}

#[derive(Insertable)]
#[diesel(table_name = account)]
pub struct AddAccount<'a> {
    pub id: &'a str,
    pub name: &'a str,
    pub type_: &'a str,
    pub balance: i32,
    pub date: &'a str,
    pub user_id: &'a str,
}

impl Serialize for Account {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where S: serde::Serializer,
  {
    let mut state = serializer.serialize_struct("Account", 6)?;
    state.serialize_field("id", &self.id)?;
    state.serialize_field("name", &self.name)?;
    state.serialize_field("type", &self.type_)?;
    state.serialize_field("balance", &self.balance)?;
    state.serialize_field("date", &self.date)?;
    state.serialize_field("user_id", &self.user_id)?;
    state.end()
  }
}


#[derive(Queryable, Selectable, Clone)]
#[diesel(table_name = crate::dbase::schema::user)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct User {
    pub id: String,
    pub name: String,
    pub pwhash: String,
    pub salt: String,
    pub email: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = user)]
pub struct AddUser<'a> {
  pub id: &'a str,
  pub name: &'a str,
  pub pwhash: &'a str,
  pub salt: &'a str,
}

impl Serialize for User {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where S: serde::Serializer,
  {
    let mut state = serializer.serialize_struct("User", 3)?;
    state.serialize_field("id", &self.id)?;
    state.serialize_field("name", &self.name)?;
    state.serialize_field("email", &self.email)?;
    state.end()
  }
}


#[derive(Queryable, Selectable, Clone)]
#[diesel(table_name = crate::dbase::schema::token)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Token {
    pub id: String,
    pub user_id: String,
    pub cursor: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = token)]
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