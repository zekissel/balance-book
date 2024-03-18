use diesel::prelude::*;
use serde::Serialize;
use serde::ser::SerializeStruct;
use super::schema::expense;
use super::schema::income;
use super::schema::account;
use super::schema::history;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::database::schema::expense)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Expense {
    pub id: i32,
    pub store: String,
    pub amount: i32,
    pub category: String,
    pub desc: String,
    pub date: String,
    pub src_account_id: String,
}

impl Serialize for Expense {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Expense", 7)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("store", &self.store)?;
        state.serialize_field("amount", &self.amount)?;
        state.serialize_field("category", &self.category)?;
        state.serialize_field("desc", &self.desc)?;
        state.serialize_field("date", &self.date)?;
        state.serialize_field("src_account_id", &self.src_account_id)?;
        state.end()
    }
}

#[derive(Insertable)]
#[diesel(table_name = expense)]
pub struct AddExpense<'a> {
    pub store: &'a str,
    pub amount: i32,
    pub category: &'a str,
    pub desc: &'a str,
    pub date: &'a str,
    pub src_account_id: &'a str,
}


#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::database::schema::income)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Income {
    pub id: i32,
    pub source: String,
    pub amount: i32,
    pub category: String,
    pub desc: String,
    pub date: String,
    pub dest_account_id: String,
}

impl Serialize for Income {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Income", 7)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("source", &self.source)?;
        state.serialize_field("amount", &self.amount)?;
        state.serialize_field("category", &self.category)?;
        state.serialize_field("desc", &self.desc)?;
        state.serialize_field("date", &self.date)?;
        state.serialize_field("dest_account_id", &self.dest_account_id)?;
        state.end()
    }
}

#[derive(Insertable)]
#[diesel(table_name = income)]
pub struct AddIncome<'a> {
    pub source: &'a str,
    pub amount: i32,
    pub category: &'a str,
    pub desc: &'a str,
    pub date: &'a str,
    pub dest_account_id: &'a str,
}


#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::database::schema::account)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Account {
    pub id: i32,
    pub account_type: String,
    pub account_id: String,
    pub balance: i32,
    pub date: String,
}

impl Serialize for Account {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Account", 5)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("account_type", &self.account_type)?;
        state.serialize_field("account_id", &self.account_id)?;
        state.serialize_field("balance", &self.balance)?;
        state.serialize_field("date", &self.date)?;
        state.end()
    }
}

#[derive(Insertable)]
#[diesel(table_name = account)]
pub struct AddAccount<'a> {
    pub account_type: &'a str,
    pub account_id: &'a str,
    pub balance: i32,
    pub date: &'a str,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::database::schema::history)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct History {
    pub id: i32,
    pub balance: i32,
    pub date: String,
}

impl Serialize for History {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("History", 3)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("balance", &self.balance)?;
        state.serialize_field("date", &self.date)?;
        state.end()
    }
}

#[derive(Insertable)]
#[diesel(table_name = history)]
pub struct AddHistory<'a> {
    pub id: i32,
    pub balance: i32,
    pub date: &'a str,
}