use diesel::prelude::*;
use serde::Serialize;
use serde::ser::SerializeStruct;
use super::schema::expense;

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
}

impl Serialize for Expense {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Expense", 6)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("store", &self.store)?;
        state.serialize_field("amount", &self.amount)?;
        state.serialize_field("category", &self.category)?;
        state.serialize_field("desc", &self.desc)?;
        state.serialize_field("date", &self.date)?;
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
}