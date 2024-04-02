use plaid::PlaidClient;
use plaid::model::*;

pub async fn sync_transactions(access_token: &str) -> Result<TransactionsSyncResponse, ()> {
  let client = PlaidClient::from_env();
  let response = client
      .transactions_sync(access_token)
      .count(1)
      .cursor("")
      .options(TransactionsSyncRequestOptions {
          days_requested: Some(1),
          include_logo_and_counterparty_beta: Some(true),
          include_original_description: Some(true),
          include_personal_finance_category: Some(true),
      })
      .await
      .unwrap();
  println!("{:#?}", response);
  Ok(response)
}