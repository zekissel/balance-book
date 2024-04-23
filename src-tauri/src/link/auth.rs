use plaid::model::LinkTokenCreateResponse;
use plaid::request::LinkTokenCreateRequired;
use plaid::model::*;

use crate::link::api::establish_plaid;
use crate::database::api::deposit_token;


#[tauri::command]
pub async fn authenticate(
  user_id: &str, 
  redirect_uri: &str,
) -> Result<String, ()> {
  let plaid_response: LinkTokenCreateResponse = create_link_token(user_id.to_owned(), redirect_uri).await;

  Ok(plaid_response.link_token)
}

pub async fn create_link_token(
  user_id: String,
  redirect_uri: &str,
) -> LinkTokenCreateResponse {

  let client = establish_plaid(&user_id).await;
  let args = LinkTokenCreateRequired {
    client_name: "Balance Book",
    country_codes: &["US","CA"],
    language: "en",
    user: LinkTokenCreateRequestUser {
      address: None,
      client_user_id: user_id.to_owned(),
      date_of_birth: None,
      email_address: None,
      email_address_verified_time: None,
      id_number: None,
      legal_name: None,
      name: None,
      phone_number: None,
      phone_number_verified_time: None,
      ssn: None,
    },
  };

  client
    .link_token_create(args)
    .products(&["transactions"])
    .redirect_uri(redirect_uri)
    //.access_token("your access token")
    //.user_token("your user token")
    //.webhook("your webhook")
    .await
    .unwrap()
}


#[tauri::command]
pub async fn authorize(
  user_id: &str,
  public_token: &str,
) -> Result<String, ()> {
  
  let client = establish_plaid(&user_id).await;
  let response = client
    .item_public_token_exchange(public_token)
    .await
    .unwrap();
  let token_id = response.access_token;
  let item_id = response.item_id;
  let token = deposit_token(user_id, &token_id, &item_id).await.unwrap();
  let _ = super::api::extract_accounts(user_id, &token_id).await;
  let _ = super::api::fetch_transactions(token, 500).await;

  Ok("Authorized".to_string())
}

#[tauri::command]
pub async fn open_link(
  url: &str,
) -> Result<(), ()> {
  match open::that(url) {
    Ok(_) => Ok(()),
    Err(_) => Err(()),
  }
}