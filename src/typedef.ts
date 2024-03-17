import { invoke } from "@tauri-apps/api/tauri";

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

export const getCategoryColor = (category: Category | IncomeCategory): string => {
  switch (category) {
    case Category.Rent:
      return '#ffcc99';
    case Category.Utilities:
      return '#ffdfbf';
    case Category.Services:
      return '#ffb3b3';
    case Category.Transportation:
      return '#dabeff';
    case Category.Groceries:
      return '#d8bfae';
    case Category.Textile:
      return '#f7cfe8';
    case Category.Appliance:
      return '#cfcfcf';
    case Category.Toilietries:
      return '#e6e6b3';
    case Category.Office:
      return '#b3e6f7';
    case Category.Investment:
      return '#b3d9ff';
    case Category.Dog:
      return '#ffd9d9';
    case Category.Entertainment:
      return '#d9e6ff';
    case Category.Gifts:
      return '#ffe6cc';
    case Category.Food:
      return '#d9ffcc';
    case Category.Dessert:
      return '#ffd9d9';
    case Category.Alcohol:
      return '#e6ccff';
    case Category.Games:
      return '#e6d4cc';
    case Category.Other:
      return '#ffe0f0';
    case Category.None:
      return '#ffe0f0';
    case IncomeCategory.Salary:
      return '#ffdfbf';
    case IncomeCategory.SideJob:
      return '#ffb3b3';
    case IncomeCategory.Reimbursement:
      return '#d8bfae';
    default:
      return '#b3d9ff';
  }
}

export enum Category {
  Rent = 'Rent',
  Utilities = 'Utilities',
  Services = 'Services',
  Transportation = 'Transportation',
  Groceries = 'Groceries',
  Textile = 'Textile',
  Appliance = 'Appliance',
  Toilietries = 'Toilietries',
  Office = 'Office',
  Investment = 'Investment',
  Dog = 'Dog',
  Entertainment = 'Entertainment',
  Gifts = 'Gifts',
  Food = 'Food',
  Dessert = 'Dessert',
  Alcohol = 'Alcohol',
  Games = 'Games',
  Other = 'Other',
  None = '---'
}

export const isExpense = (x: any): x is Expense => Object.keys(x).includes('store');

export interface Expense {
  id: number;
  store: string;
  amount: number;
  category: Category;
  desc: string;
  date: Date;
}

export interface Income {
  id: number;
  source: string;
  amount: number;
  category: IncomeCategory;
  desc: string;
  date: Date;
}

export enum IncomeCategory {
  Salary = 'Salary',
  SideJob = 'SideJob',
  InvestmentIncome = 'InvestmentIncome',
  Reimbursement = 'Reimbursement',
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

export function addDays(date: Date, days: number) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    0, 0, 0, 0
  );
}

export function getEnumKeys<
   T extends string,
   TEnumValue extends string | number,
>(enumVariable: { [key in T]: TEnumValue }) {
    return Object.keys(enumVariable) as Array<T>;
}

export async function getExpenses(): Promise<Expense[]> {
  return await invoke("load_expenses")
    .then(data => {
      const exp = data as Expense[];
      exp.forEach(e => e.date = new Date(new Date(e.date).toDateString()));
      exp.sort((a, b) => a.date > b.date ? -1 : 1);
      return exp;
    })
}

export async function getIncome(): Promise<Income[]> {
  return await invoke("load_income")
    .then(data => {
      const inc = data as Income[];
      inc.forEach(i => i.date = new Date(new Date(i.date).toDateString()));
      inc.sort((a, b) => a.date > b.date ? -1 : 1);
      return inc;
    })
}

export interface Filters {
  type: string,
  startDate: Date | null,
  endDate: Date | null,
  category: string[],
  source: string[],
  lowAmount: string,
  highAmount: string,
}


export interface Account {
  id: number;
  account_type: AccountType;
  account_id: string;
  balance: number;
  date: Date;
}

export enum AccountType {
  Checking = "Checking",
  Savings = "Savings",
  Investing = "Investing",
}

export async function getAccounts(): Promise<Account[]> {
  return await invoke("load_account")
    .then(data => {
      const acc = data as Account[];
      acc.forEach(e => e.date = new Date(e.date));
      acc.sort((a, b) => a.date > b.date ? -1 : 1);
      return acc;
    })
}

export function generateRandomColor(color: string, color2: string, income: boolean) {
  const letters = '789ABCDEF';
  const additive = income ? 0x222222 : 0x111111;
  color = Math.random() > .5 ? (parseInt(color, 16) + additive).toString(16) : (parseInt(color2, 16) - additive).toString(16);

  for (let i = 0; i < 2; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
    color2 += letters[Math.floor(Math.random() * letters.length)];
  }

  return `#${Math.random() > .5 ? color : color2}`;
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

  transactions = transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  return transactions;
}