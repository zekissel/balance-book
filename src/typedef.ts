
export interface User {
  id: string;
  uname: string;
  email: string | null;
  fname: string | null;
  lname: string | null;
  dob: Date | null;
}

export enum DataState {
  Loading,
  Success,
  Error,
}

export enum State {
  Auth,
  Home,
  Activity,
  Stats,
  Assets,
  Market,
  Profile,
  Settings,
}

export function getEnumKeys<
   T extends string,
   TEnumValue extends string | number,
>(enumVariable: { [key in T]: TEnumValue }) {
    return Object.keys(enumVariable) as Array<T>;
}

export enum ExpenseCat {
  Rent = 'Rent',
  Utilities = 'Utilities',
  Transportation = 'Transportation',
  Groceries = 'Groceries',
  Services = 'Services',
  Textile = 'Textile',
  Toilietries = 'Toilietries',
  Home = 'Home',
  Office = 'Office',
  Pet = 'Pet',
  Gifts = 'Gifts',
  Entertainment = 'Entertainment',
  Food = 'Food',
  Snacks = 'Snacks',
  Drinks = 'Drinks',
  Savings = 'Savings',
  Investment = 'Investment',
  Other = 'Other',
  None = '---'
}
export enum IncomeCat {
  Salary = 'Salary',
  SideJob = 'SideJob',
  Reimbursement = 'Reimbursement',
  SavingsIncome = 'SavingsIncome',
  InvestmentIncome = 'InvestmentIncome',
  OtherIncome = 'OtherIncome',
  None = '---',
}

export interface Transaction {
  id: number;
  company: string;
  amount: number;
  category: ExpenseCat | IncomeCat;
  date: Date;
  desc: string;
  account_id: number;
  secondary_id: number | null;
}


export interface Day {
  date: Date;
  transactions: Transaction[];
}

export const Month = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]


export interface Account {
  id: number;
  user_id: string;
  account_type: AccountType;
  account_name: string;
  balance: number;
  date: Date;
}

export enum AccountType {
  Checking = "Checking",
  Savings = "Savings",
  Investing = "Investing",
}



export interface Filter {
  type: string,
  startDate: Date | null,
  endDate: Date | null,
  category: string[],
  source: string[],
  lowAmount: string,
  highAmount: string,
  accounts: number[],
}

export function anyFiltersActive (filter: Filter): boolean {
  return (filter.type !== `all` || filter.startDate !== null || filter.endDate !== null || filter.category.length > 0 || filter.source[0].length > 0 || Number(filter.lowAmount) !== 0 || Number(filter.highAmount) !== 0 || filter.accounts.length > 0);
};

export function filterTransactions ({ transactions, filters }: { transactions: Transaction[], filters: Filter }): Transaction[] {
  let ret: Transaction[] = [];

  if (filters.type === `expense` || filters.type === `all`) ret = ret.concat(transactions.filter(t => t.amount < 0));
  if (filters.type === `income` || filters.type === `all`) ret = ret.concat(transactions.filter(t => t.amount > 0));

  if (filters.startDate !== null) ret = ret.filter(t => t.date.getTime() >= filters.startDate!.getTime());
  if (filters.endDate !== null) ret = ret.filter(t => t.date.getTime() <= filters.endDate!.getTime());

  if (filters.category.length > 0) ret = ret.filter(t => filters.category.includes(t.category.toString()));

  if (filters.source[0].length > 0) ret = ret.filter(t => {
    // match partial names
    const sources = filters.source.map((s: string) => s.toUpperCase().trim())
    return sources.some((s: string) => t.company.toUpperCase().includes(s));
  });

  if (Number(filters.lowAmount) > 0) ret = ret.filter(t => (t.amount - ((Number(filters.lowAmount)) * 100)) >= 0 );
  if (Number(filters.highAmount) > 0) ret = ret.filter(t => (t.amount - ((Number(filters.highAmount)) * 100)) <= 0 );

  if (filters.accounts.length > 0) ret = ret.filter(t => filters.accounts.includes(t.account_id));

  return ret.sort((a, b) => b.date.getTime() - a.date.getTime());
}