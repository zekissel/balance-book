import { invoke } from "@tauri-apps/api/tauri";
import { ExpenseCat, IncomeCat, Transaction, Account } from './typedef';

export const getCategoryColor = (category: ExpenseCat | IncomeCat): string => {
  switch (category) {
    case ExpenseCat.Other: case IncomeCat.OtherIncome: return '#F5E890';
    case ExpenseCat.Savings: case IncomeCat.SavingsIncome: return '#C2F3FA';
    case ExpenseCat.Investment: case IncomeCat.InvestmentIncome: return '#F9C9C9';
    case ExpenseCat.Groceries: return '#E6C9F9'; case ExpenseCat.Food: return '#F9C9ED';
    case ExpenseCat.Rent: return '#B0CCF0'; case ExpenseCat.Utilities: return '#C9F9E6';
    case ExpenseCat.Transportation: return '#F9E6C9'; case ExpenseCat.Entertainment: return '#F9F0C9';
    case ExpenseCat.Home: return '#A6F5F4'; case ExpenseCat.Office: return '#F5C0DB';
    case ExpenseCat.Services: return '#BAF5DB'; case ExpenseCat.Gifts: return '#E0ABFC';
    case ExpenseCat.Textile: return '#F0A2B2'; case ExpenseCat.Toilietries: return '#CFBAF9';
    case ExpenseCat.Drinks: return '#F9C9B6'; case ExpenseCat.Snacks: return '#ECF9BA';
    case IncomeCat.Salary: return '#C9F9E6'; case IncomeCat.SideJob: return '#F8CDF9';
    case IncomeCat.Reimbursement: return '#C9CBC7'; case ExpenseCat.Pet: return '#FAD49F';
    default: return '#fff';
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

export async function getTransactions(): Promise<Transaction[]> {
  return await invoke("get_transactions")
    .then(data => {
      const trans = data as Transaction[];
      trans.forEach(t => t.date = addDays(new Date(new Date(t.date).toUTCString().split(' ').slice(0, 4).join(' ')), 0));
      return trans.sort((a, b) => a.date > b.date ? -1 : 1);
    })
}


export async function getAccounts(): Promise<Account[]> {
  return await invoke("get_accounts")
    .then(data => {
      const acc = data as Account[];
      acc.forEach(e => e.date = new Date(e.date));
      return acc.sort((a, b) => a.date > b.date ? -1 : 1);
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
