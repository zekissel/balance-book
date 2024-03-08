
export enum State {
  Home,
  Activity,
  Stats,
  Assets,
}

export interface UpdateLogProps {
  signalExp: () => void;
  signalInc: () => void;
}

export interface LogProps { expenses: Expense[], income: Income[] }

export interface NavProps { setState: React.Dispatch<React.SetStateAction<State>> }
export interface ActivityProps { expenses: Expense[] }

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

export interface Expense {
  store: string;
  amount: number;
  category: Category;
  desc: string;
  date: Date;
}

export interface Income {
  source: string;
  amount: number;
  category: IncomeCategory;
  desc: string;
  date: Date;
}

export enum IncomeCategory {
  Salary = 'Salary',
  SideJob = 'SideJob',
  Investment = 'Investment',
  Reimbursement = 'Reimbursement',
  Other = 'Other',
  None = '---',
}

export interface Day {
  date: Date;
  expenses: Expense[];
  income: Income[];
}

export const Month = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]