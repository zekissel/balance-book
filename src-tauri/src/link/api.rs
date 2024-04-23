use plaid::PlaidClient;
use plaid::model::*;
use serde::Serialize;
use serde::ser::SerializeStruct;

use crate::database::models::Token;

async fn sync_transactions(access_token: &str, count: i16, cursor: Option<&str>) -> Result<TransactionsSyncResponse, ()> {
  let client = PlaidClient::from_env();
  let response = client
    .transactions_sync(access_token)
    .count(count.into())
    .cursor(cursor.unwrap_or(""))
    .options(TransactionsSyncRequestOptions {
      days_requested: None,
      include_logo_and_counterparty_beta: None,//Some(true),
      include_original_description: Some(true),
      include_personal_finance_category: Some(true),
    })
    .await
    .unwrap();
  println!("{:#?}", response);
  Ok(response)
}

/* https://plaid.com/documents/transactions-personal-finance-category-taxonomy.csv */
fn extract_category(primary: &str, detailed: &str, amount: i32) -> String {
  let pattern = &format!("{}_", primary);
  let det = detailed.strip_prefix(pattern).unwrap_or(detailed);

  let mut ret = "".to_owned();
  ret.push_str(match primary {
    "INCOME" => match det {
      "DIVIDENDS" => "FinanceIncome>Interest",
      "INTEREST_EARNED" => "FinanceIncome>Interest",
      "RETIREMENT_PENSION" => "Government>Pension",
      "TAX_REFUND" => "Government>Taxes",
      "UNEMPLOYMENT" => "Government>Unemployment",
      "WAGES" => "Salary>Bi-Weekly",
      _ => "OtherIncome>Other",
    },
    "TRANSFER_IN" => match det {
      "CASH_ADVANCES_AND_LOANS" => "FinanceIncome>Loan",
      //"DEPOSIT" => "FinanceIncome>Other",
      //"INVESTMENT_AND_RETIREMENT_FUNDS" => "",
      //"SAVINGS" => "",
      //"ACCOUNT_TRANSFER" => "",
      //"OTHER_TRANSFER_IN" => "",
      _ => "FinanceIncome>Other",
    },
    "TRANSFER_OUT" => "FinanceExpense>Other",
    "LOAN_PAYMENTS" => "Financial>Loan Payment",
    "BANK_FEES" => "Financial>Taxes/Fees",
    "ENTERTAINMENT" => match det {
      "MUSIC_AND_AUDIO" => "Entertainment>Music",
      "SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS" => "Entertainment>Events",
      "TV_AND_MOVIES" => "Entertainment>Movies/TV",
      "VIDEO_GAMES" => "Entertainment>Games",
      //"CASINOS_AND_GAMBLING" => "Entertainment>Other",
      _ => "Entertainment>Other",
    },
    "FOOD_AND_DRINK" => match det {
      "BEER_WINE_AND_LIQUOR" => "Food>Alcohol",
      "COFFEE" => "Food>Drinks",
      "FAST_FOOD" => "Food>Fast Food",
      "GROCERIES" => "Food>Groceries",
      "RESTAURANTS" => "Food>Restaurants",
      _ => "Food>Other",
    },
    "GENERAL_MERCHANDISE" => match det {
      "BOOKSTORES_AND_NEWSSTANDS" => "Services>Education",
      "CLOTHING_AND_ACCESSORIES" => "Personal>Apparel",
      //"CONVENIENCE_STORES" => "Other>Other",
      "DEPARTMENT_STORES" => "Home>Amenities",
      //"DISCOUNT_STORES" => "Other>Other",
      "ELECTRONICS" => "Personal>Electronics",
      "GIFTS_AND_NOVELTIES" => "Other>Gifts",
      "OFFICE_SUPPLIES" => "Studio>Supplies",
      "ONLINE_MARKETPLACES" => "Other>Other",
      "PET_SUPPLIES" => "Other>Pets",
      "SPORTING_GOODS" => "Personal>Fitness/Beauty",
      //"SUPERSTORES" => "Other>Other",
      "TOBACCO_AND_VAPE" => "Other>Non-Essentials",
      _ => "Other>Other",
    },
    "HOME_IMPROVEMENT" => match det {
      "FURNITURE" => "Home>Amenities",
      "HARDWARE" => "Studio>Supplies",
      "REPAIR_AND_MAINTENANCE" => "Home>Maintenance",
      //"SECURITY" => "Home>Other",
      _ => "Home>Other",
    },
    "MEDICAL" => match det {
      "DENTAL_CARE" => "Healthcare>Dental",
      "EYE_CARE" => "Healthcare>Vision",
      //"NURSING_CARE" => "Healthcare>Other",
      "PHARMACIES_AND_SUPPLEMENTS" => "Healthcare>Medication",
      "PRIMARY_CARE" => "Healthcare>Primary",
      "VETERINARY_SERVICES" => "Other>Pets",
      _ => "Healthcare>Other",
    },
    "PERSONAL_CARE" => match det {
      "GYMS_AND_FITNESS_CENTERS" => "Personal>Fitness/Beauty",
      "HAIR_AND_BEAUTY" => "Personal>Fitness/Beauty",
      "LAUNDRY_AND_DRY_CLEANING" => "Services>Laundry",
      _ => "Personal>Other",
    },
    "GENERAL_SERVICES" => match det {
      "ACCOUNTING_AND_FINANCIAL_PLANNING" => "Services>Consulting",
      "AUTOMOTIVE" => "Services>Automotive",
      //"CHILDCARE" => "Services>Other",
      "CONSULTING_AND_LEGAL" => "Services>Consulting",
      "EDUCATION" => "Services>Education",
      "INSURANCE" => "Services>Insurance",
      //"POSTAGE_AND_SHIPPING" => "Services>Other",
      "STORAGE" => "Services>Storage",
      _ => "Services>Other",
    },
    "GOVERNMENT_AND_NON_PROFIT" => match det {
      "DONATIONS" => "Other>Charity",
      "GOVERNMENT_DEPARTMENTS_AND_AGENCIES" => "Financial>Other",
      "TAX_PAYMENT" => "Financial>Taxes/Fees",
      _ => "Other>Other",
    },
    "TRANSPORTATION" => match det {
      "BIKES_AND_SCOOTERS" => "Transport>Tolls/Fees",
      "GAS" => "Transport>Gas",
      "PARKING" => "Transport>Parking",
      "PUBLIC_TRANSIT" => "Transport>Tolls/Fees",
      "TAXIS_AND_RIDE_SHARES" => "Transport>Ride Share",
      "TOLLS" => "Transport>Tolls/Fees",
      _ => "Transport>Other",
    },
    "TRAVEL" => match det {
      "FLIGHTS" => "Travel>Flights",
      "LODGING" => "Travel>Lodging",
      "RENTAL_CARS" => "Travel>Rentals",
      _ => "Travel>Other",
    },
    "RENT_AND_UTILITIES" => match det {
      "GAS_AND_ELECTRICITY" => "Utilities>Gas/Electricity",
      "INTERNET_AND_CABLE" => "Utilities>Internet",
      "RENT" => "Home>Rent",
      "SEWAGE_AND_WASTE_MANAGEMENT" => "Utilities>Trash/Recycle",
      "TELEPHONE" => "Utilities>Cellular",
      "WATER" => "Utilities>Water",
      _ => "Utilities>Other",
    },
    _ => if amount < 0 { "Other>Other" } else { "OtherIncome>Other" },
  });
  
  return ret;
}

pub async fn fetch_transactions(token: Token, number: i16) -> Result<Vec<String>, ()> {
  
  fn format_transaction(
    trans: plaid::model::Transaction
  ) -> (String, String, i32, String, String, String, String) {
    let t_id = trans.transaction_id.to_string();
    let company = trans.name.as_ref().unwrap_or(&"N/A".to_owned()).to_string();
    let amount = (trans.amount * -100.) as i32;
    let date = trans.date.to_string();
    let account_id = trans.account_id.to_string();

    let base = trans.personal_finance_category.unwrap();
    let primary = base.primary.as_ref();
    let detailed = base.detailed.as_ref();
    let category = extract_category(primary, detailed, amount);
    //trans.category.as_ref().unwrap_or(&vec![if amount < 0 {"Other>Other"} else {"OtherIncome>Other"}.to_string()]).join(", ");
    let desc = detailed.to_string();

    (t_id, company, amount, category, date, desc, account_id)
  }

  let mut updated: Vec<String> = vec![];
  let mut more = true;
  let mut count = 1;
  let mut cursor: String = token.cursor.as_ref().unwrap_or(&"".to_owned()).to_string();
  while more {
    println!("Fetching transactions: {:#?}", count);
    count += 1;
    match sync_transactions(&token.id, number, Some(&cursor)).await {
      Ok(mut d) => {
        let mut list = d.added;
        list.append(&mut d.modified);

        for trans in list {
          let new_trans = format_transaction(trans);
          let _ = match crate::database::api::read_transaction_by_id(&new_trans.0).await {
            Some(_tr) => crate::database::api::update_transaction(&new_trans.0, &new_trans.1, new_trans.2, None, &new_trans.4, &new_trans.5, &new_trans.6).await,
            None => crate::database::api::create_transaction(Some(&new_trans.0), &new_trans.1, new_trans.2, &new_trans.3, &new_trans.4, &new_trans.5, &new_trans.6).await,
          };
          updated.push(new_trans.0);
        };
        for trans in d.removed {
          let _ = crate::database::api::delete_transaction(&trans.transaction_id.unwrap());
        }
        more = d.has_more;
        cursor = d.next_cursor.to_owned();
      },
      Err(_) => more = false,
    };
  };
  let _ = crate::database::api::update_token_cursor(&token.id, &cursor).await;

  Ok(updated)
}

pub async fn fetch_balance(token: Token) -> Result<bool, ()> {
  let client = PlaidClient::from_env();
  let response = client
    .accounts_balance_get(&token.id)
    .await
    .unwrap();

  for acc in response.accounts {
    let a_id = &acc.account_id;
    let balance = (acc.balances.current.unwrap() * 100.) as i32;
    let date = &chrono::Utc::now().to_string();
    let _ = crate::database::api::update_account_balance(&a_id, balance, date).await;
  }
  Ok(true)
}

pub async fn extract_accounts(user_id: &str, access_token: &str) -> Result<bool, ()> {
  fn to_upper(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
      None => String::new(),
      Some(f) => f.to_uppercase().chain(c).collect(),
    }
  }

  let client = PlaidClient::from_env();
  let response = client
    .accounts_balance_get(access_token)
    .await
    .unwrap();

  for acc in response.accounts {
    let a_id = &acc.account_id;
    let account_name = &acc.name;
    let balance = (acc.balances.current.unwrap() * 100.) as i32;
    let date = &chrono::Utc::now().to_string();
    let account_type = match acc.type_.as_ref() {
      "depository" => match acc.subtype.as_ref() {
        Some(AccountSubtype(..)) => {
          let inter = format!("{:#?}", acc.subtype.as_ref().unwrap());
          to_upper(inter.split("\"").collect::<Vec<_>>()[1])
        },
        None => "Checking".to_owned(),
      },
      "investment" => "Investment".to_owned(),
      "credit" => "Credit".to_owned(),
      "loan" => "Loan".to_owned(),
      _ => "Other".to_owned(),
    };
    
    let _new_acc = crate::database::api::create_account(Some(a_id), user_id, &account_type, account_name, balance, date).await;
  }
  Ok(true)
}

#[allow(dead_code)]
pub struct InstitutionStatus {
  name: String,
  last_update: String,
  status: String,
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
pub async fn read_status(token: Token) -> Result<InstitutionStatus, ()> {
  let client = PlaidClient::from_env();
  let response = client
    .item_get(&token.id)
    .await
    .unwrap();

  let recent = response.status.unwrap().transactions.unwrap().last_successful_update.unwrap().to_string();
  let inst_id = response.item.institution_id.unwrap();

  let response2 = client
    .institutions_get_by_id(&[&"US".to_owned(), &"CA".to_owned()], &inst_id)
    .await
    .unwrap();

  let name = response2.institution.name;
  let status = match response2.institution.status {
    Some(is) => is.transactions_updates.unwrap().status,
    None => "Unknown".to_owned(),
  };
  Ok(InstitutionStatus{ name, last_update: recent, status })
}