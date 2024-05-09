use serde::Deserialize;

#[derive(Clone, Deserialize)]
pub struct PlaidKey {
  pub client_id: String,
  pub secret: String,
}