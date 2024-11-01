
/* https://plaid.com/documents/transactions-personal-finance-category-taxonomy.csv */
pub fn extract_category(primary: &str, detailed: &str, amount: i32) -> String {
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