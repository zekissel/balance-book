use serde::Deserialize;
use serde::Serialize;
use serde::ser::SerializeStruct;

#[derive(Clone, Deserialize)]
pub struct PlaidKey {
  pub client_id: String,
  pub secret: String,
}

#[allow(dead_code)]
pub struct InstitutionStatus {
  pub name: String,
  pub last_update: String,
  pub status: String,
}
impl Serialize for InstitutionStatus {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
      S: serde::Serializer,
  {
      let mut state = serializer.serialize_struct("InstitutionStatus", 3)?;
      state.serialize_field("name", &self.name)?;
      state.serialize_field("last_update", &self.last_update)?;
      state.serialize_field("status", &self.status)?;
      state.end()
  }
}