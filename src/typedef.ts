
export enum State {
  Home,
  Activity,
  Stats,
  Assets,
  Market,
  Profile,
  Settings,
}

export type LogProps = (Expense | Income)[];
export interface UpdateLogProps {
  signalExp: () => void;
  signalInc: () => void;
}

export function getEnumKeys<
   T extends string,
   TEnumValue extends string | number,
>(enumVariable: { [key in T]: TEnumValue }) {
    return Object.keys(enumVariable) as Array<T>;
}

export enum Category {
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

export interface Expense {
  id: number;
  store: string;
  amount: number;
  category: Category;
  desc: string;
  date: Date;
  account_id: number;
}

export const isExpense = (x: any): x is Expense => Object.keys(x).includes('store');

export interface Income {
  id: number;
  source: string;
  amount: number;
  category: IncomeCategory;
  desc: string;
  date: Date;
  account_id: number;
}

export enum IncomeCategory {
  Salary = 'Salary',
  SideJob = 'SideJob',
  Reimbursement = 'Reimbursement',
  SavingsIncome = 'SavingsIncome',
  InvestmentIncome = 'InvestmentIncome',
  OtherIncome = 'OtherIncome',
  None = '---',
}

export interface Day {
  date: Date;
  transactions: (Expense | Income)[];
}

export const Month = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]



export interface Account {
  id: number;
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

export interface History {
  id: number;
  account_id: number;
  balance: number;
  date: Date;
}
export const isHistory = (x: any): x is History => (Object.keys(x).includes('balance') && !Object.keys(x).includes('account_type'));


export interface Filters {
  type: string,
  startDate: Date | null,
  endDate: Date | null,
  category: string[],
  source: string[],
  lowAmount: string,
  highAmount: string,
  accounts: number[],
}

export function filterTransactions ({ expenses, income, filters }: { expenses: Expense[], income: Income[], filters: Filters }): (Expense | Income)[] {
  let transactions: Array<Expense | Income> = [];

  if (filters.type === `expense` || filters.type === `all`) transactions = transactions.concat(expenses);
  if (filters.type === `income` || filters.type === `all`) transactions = transactions.concat(income);

  if (filters.startDate !== null) transactions = transactions.filter(t => t.date.getTime() >= filters.startDate!.getTime());
  if (filters.endDate !== null) transactions = transactions.filter(t => t.date.getTime() <= filters.endDate!.getTime());

  if (filters.category.length > 0) transactions = transactions.filter(t => filters.category.includes(t.category.toString()));

  if (filters.source[0].length > 0) transactions = transactions.filter(t => filters.source.map(s => s.toUpperCase().trim()).includes((isExpense(t) ? t.store : t.source).toUpperCase()));

  if (Number(filters.lowAmount) > 0) transactions = transactions.filter(t => (t.amount - ((Number(filters.lowAmount)) * 100)) >= 0 );
  if (Number(filters.highAmount) > 0) transactions = transactions.filter(t => (t.amount - ((Number(filters.highAmount)) * 100)) <= 0 );

  if (filters.accounts.length > 0) transactions = transactions.filter(t => filters.accounts.includes(t.account_id));

  transactions = transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  return transactions;
}