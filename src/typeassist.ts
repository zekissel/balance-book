import { invoke } from "@tauri-apps/api/tauri";
import { ExpenseCat, IncomeCat, Transaction, Account } from './typedef';

export const getCategoryColor = (category: ExpenseCat | IncomeCat): string => {
  return category.length > 10 ? '#cba' : '#abc';
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
      trans.forEach(t => t.date = new Date(t.date));
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