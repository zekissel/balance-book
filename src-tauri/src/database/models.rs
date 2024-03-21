use diesel::prelude::*;
use serde::Serialize;
use serde::ser::SerializeStruct;

use super::schema::transaction;
use super::schema::account;


#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::database::schema::transaction)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Transaction {
    pub id: i32,
    pub company: String,
    pub amount: i32,
    pub category: String,
    pub date: String,
    pub desc: String,
    pub account_id: i32,
    pub secondary_id: Option<i32>,
}

#[derive(Insertable)]
#[diesel(table_name = transaction)]
pub struct AddTransaction<'a> {
    pub company: &'a str,
    pub amount: i32,
    pub category: &'a str,
    pub date: &'a str,
    pub desc: &'a str,
    pub account_id: i32,
    pub secondary_id: Option<i32>,
}

impl Serialize for Transaction {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Transaction", 8)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("company", &self.company)?;
        state.serialize_field("amount", &self.amount)?;
        state.serialize_field("category", &self.category)?;
        state.serialize_field("date", &self.date)?;
        state.serialize_field("desc", &self.desc)?;
        state.serialize_field("account_id", &self.account_id)?;
        state.serialize_field("secondary_id", &self.secondary_id)?;
        state.end()
    }
}



#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::database::schema::account)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Account {
    pub id: i32,
    pub account_type: String,
    pub account_name: String,
    pub balance: i32,
    pub date: String,
}

#[derive(Insertable)]
#[diesel(table_name = account)]
pub struct AddAccount<'a> {
    pub account_type: &'a str,
    pub account_name: &'a str,
    pub balance: i32,
    pub date: &'a str,
}

impl Serialize for Account {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Account", 5)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("account_type", &self.account_type)?;
        state.serialize_field("account_name", &self.account_name)?;
        state.serialize_field("balance", &self.balance)?;
        state.serialize_field("date", &self.date)?;
        state.end()
    }
}

