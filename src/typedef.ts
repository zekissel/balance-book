
export enum State {
  Home,
  Activity,
  Stats,
  Assets,
}

export interface NavProps { setState: React.Dispatch<React.SetStateAction<State>> }
export interface ActivityProps { expenses: Expense[] }

export enum Category {
  Rent = 'Rent',
  Utilities = 'Utilities',
  Services = 'Services',
  Automobile = 'Automobile',
  Groceries = 'Groceries',
  Textile = 'Textile',
  Appliance = 'Appliance',
  Toilietries = 'Toilietries',
  Office = 'Office',
  Investment = 'Investment',
  Dog = 'Dog',
  Entertainment = 'Entertainment',
  Food = 'Food',
  Dessert = 'Dessert',
  Alcohol = 'Alcohol',
  Games = 'Games',
  Other = 'Other',
  None = 'None'
}

export interface Expense {
  store: string;
  amount: number;
  category: Category;
  desc: string;
  date: Date;
}

export interface Day {
  date: Date;
  expenses: Expense[];
}

export const Month = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]