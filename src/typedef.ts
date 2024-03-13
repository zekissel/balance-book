import { invoke } from "@tauri-apps/api/tauri";

export enum State {
  Home,
  Activity,
  Stats,
  Assets,
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
  Investment = 'InvestmentIncome',
  Reimbursement = 'Reimbursement',
  Other = 'OtherIncome',
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