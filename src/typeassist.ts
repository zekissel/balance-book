import { invoke } from "@tauri-apps/api/tauri";
import { Category, IncomeCategory, Expense, Income, Account, History } from './typedef';

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
    case Category.Home:
      return '#cfcfcf';
    case Category.Toilietries:
      return '#e6e6b3';
    case Category.Office:
      return '#b3e6f7';
    case Category.Savings:
      return '#b3d9ff';
    case Category.Investment:
      return '#b3d9ff';
    case Category.Pet:
      return '#ffd9d9';
    case Category.Entertainment:
      return '#d9e6ff';
    case Category.Gifts:
      return '#ffe6cc';
    case Category.Food:
      return '#d9ffcc';
    case Category.Snacks:
      return '#ffd9d9';
    case Category.Drinks:
      return '#e6ccff';
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

export function addDays(date: Date, days: number) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    0, 0, 0, 0
  );
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

export async function getAccounts(): Promise<Account[]> {
  return await invoke("load_account")
    .then(data => {
      const acc = data as Account[];
      acc.forEach(e => e.date = new Date(e.date));
      acc.sort((a, b) => a.date > b.date ? -1 : 1);
      return acc;
    })
}

export async function getHistory(): Promise<History[]> {
  return await invoke("load_history")
    .then(data => {
      const hist = data as History[];
      hist.forEach(e => e.date = new Date(e.date));
      hist.sort((a, b) => a.date > b.date ? -1 : 1);
      return hist;
    })
}


export function generateChartColor(index: number, isIncome: boolean) {
  const incomeColors = [
    '#739d88', '#86C4A5', '#9CFACB', '#BADACA', '#50A47A', '#42C483'
  ];
  const expenseColors = [
    '#f6d6aa', '#D8AA69', '#AB8755', '#E8AD5A', '#DAC25F', '#FADC65'
  ];
  return isIncome ? incomeColors[index % incomeColors.length] : expenseColors[index % expenseColors.length];
}