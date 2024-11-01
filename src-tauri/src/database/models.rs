use serde::ser::SerializeStruct;
use serde::Serialize;


#[allow(dead_code)]
#[derive(sqlx::FromRow, Clone)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub pwhash: String,
    pub salt: String,
}
impl Serialize for User {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("User", 3)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("name", &self.name)?;
        state.serialize_field("email", &self.email)?;
        state.end()
    }
}

#[allow(dead_code)]
#[derive(sqlx::FromRow, Clone)]
pub struct Token {
    pub id: String,
    pub cursor: Option<String>,
    pub user_id: String,
}
impl Serialize for Token {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Token", 3)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("cursor", &self.cursor)?;
        state.serialize_field("user_id", &self.user_id)?;
        state.end()
    }
}

#[allow(dead_code)]
#[derive(sqlx::FromRow)]
pub struct Account {
    pub id: String,
    pub name: String,
    pub type_: String,
    pub balance: i64,
    pub date: String,
    pub user_id: String,
}
impl Serialize for Account {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Account", 6)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("name", &self.name)?;
        state.serialize_field("type_", &self.type_)?;
        state.serialize_field("balance", &self.balance)?;
        state.serialize_field("date", &self.date)?;
        state.serialize_field("user_id", &self.user_id)?;
        state.end()
    }
}

#[allow(dead_code)]
#[derive(sqlx::FromRow)]
pub struct Transaction {
    pub id: String,
    pub store: String,
    pub amount: i64,
    pub category: String,
    pub date: String,
    pub desc: String,
    pub account_id: String,
}
impl Serialize for Transaction {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Transaction", 7)?;
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

#[derive(Debug, Clone)]
pub struct BookError {
    pub code: i8,
    pub message: String,
}
impl Serialize for BookError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("BookError", 2)?;
        state.serialize_field("code", &self.code)?;
        state.serialize_field("message", &self.message)?;
        state.end()
    }
}
