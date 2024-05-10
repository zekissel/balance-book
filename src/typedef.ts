import { invoke } from "@tauri-apps/api";
import { Filter } from "./component/filter";

export interface User {
  id: string;
  name: string;
  email: string | null;
}

export interface Account {
	id: string;
	type: AccountType;
	name: string;
	balance: number;
	date: string;//Date;
  user_id: string;
}

export interface Transaction {
	id: string;
	store: string;
	amount: number;
	category: Category;
	date: Date;
	desc: string;
	account_id: string;
}

export enum AccountType {
	Checking = 'Checking',
	Credit = 'Credit',
	Savings = 'Savings',
	Investment = 'Investment',
	Loan = 'Loan',
}


export type Category = 
  `${IncomeRoot}>${typeof IncomeLeaf[IncomeRoot][number]}` | 
  `${ExpenseRoot}>${typeof ExpenseLeaf[ExpenseRoot][number]}`;

export enum ExpenseRoot {
	Home = 'Home',
	Utilities = 'Utilities',
	Food = 'Food',
	Transport = 'Transport',
	Healthcare = 'Healthcare',
	Personal = 'Personal',
	Services = 'Services',
	Studio = 'Studio',
	Entertainment = 'Entertainment',
	Travel = 'Travel',
	Financial = 'Financial',
	Other = 'Other',
};
export const ExpenseLeaf = {
	Home: ['Rent', 'Maintenance', 'Amenities', 'Garden', 'Insurance', 'Other'],
	Utilities: ['Gas/Electricity', 'Water', 'Internet', 'Cellular', 'Trash/Recycle', 'Other'],
	Food: ['Groceries', 'Restaurants', 'Fast Food', 'Drinks', 'Alcohol', 'Other'],
	Transport: ['Gas', 'Parking', 'Tolls/Fees', 'Ride Share', 'Other'],
	Healthcare: ['Primary', 'Dental', 'Vision', 'Insurance', 'Medication', 'Other'],
	Personal: ['Apparel', 'Toilietries', 'Electronics', 'Fitness/Beauty', 'Other'],
	Services: ['Automotive', 'Education', 'Contracting', 'Consulting', 'Laundry', 'Storage', 'Insurance', 'Other'],
	Studio: ['Supplies', 'Services', 'Projects', 'Insurance', 'Other'],
	Entertainment: ['Movies/TV', 'Games', 'Events', 'Music', 'Other'],
	Travel: ['Flights', 'Lodging', 'Rentals', 'Other'],
	Financial: ['Transfer', 'Credit', 'Taxes/Fees', 'Loan Payment', 'Other'],
	Other: ['Non-Essentials', 'Gifts', 'Pets', 'Charity', 'Other'],
};

export const CrossLeaf = {
	Finance: ['Transfer', 'Credit', 'Other'],
	Other: ['Other'],
};

export enum IncomeRoot {
	Salary = 'Salary',
	SideJob = 'SideJob',
	Government = 'Government',
	FinanceIncome = 'FinanceIncome',
	OtherIncome = 'OtherIncome',
};
export const IncomeLeaf = {
	Salary: ['Monthly', 'Bi-Weekly', 'Weekly', 'Other'],
	SideJob: ['Contract', 'Freelance', 'Temporary','Other'],
	Government: ['Welfare', 'Unemployment', 'Pension', 'Taxes', 'Other'],
	FinanceIncome: ['Transfer', 'Credit', 'Interest', 'Loan', 'Other'],
	OtherIncome: ['Reimbursement', 'Refund', 'Gifts', 'Other'],
};


export async function getAccounts(): Promise<Account[]> {
	return await invoke('fetch_account').then((data) => {
		const acc = data as Account[];
		//acc.forEach((a) => (a.date =  new Date(a.date)))
		return acc;//.sort((a, b) => (a.date > b.date ? -1 : 1));
	});
}

export async function getTransactions(
	filters: Filter,
	index: { current_page: number, page_size: number, sort_field: string, sort_asc: boolean }
): Promise<[Transaction[], number]> {
	return await invoke('fetch_transaction', { filters, index }).then(
		(data) => {
			const [trans, count] = data as [Transaction[], number];
			trans.forEach((t) => {
				t.date = new Date(new Date(t.date).toUTCString().split(' ').slice(0, 4).join('-'));
			});
			return [trans, count];
		},
	);
}

export async function getCalendarTransactions(
	filters: Filter,
): Promise<Transaction[]> {
	return await invoke('fetch_transaction_calendar', { filters }).then(
		(data) => {
			const trans = data as Transaction[];
			return trans.map((t) => new Object({
				...t,
				date: new Date(new Date(t.date).toUTCString().split(' ').slice(0, 4).join('-')),
			}) as Transaction);
		},
	);
}

const matchAccountType = (type: string | undefined) => {
	switch (type) {
		case 'Checking': return 'Check';
		case 'Credit': return 'Cred';
		case 'Savings': return 'Sav';
		case 'Investment': return 'Inv';
		case 'Loan': return 'Loan';
		default: return 'Other';
	}
}
export const formatAccount = (id: string, accounts: Account[]) => {
	if (id === 'Multiple') return 'Multiple';
	return `${matchAccountType(accounts.find(a => a.id === id)?.type)}:${accounts.find(a => a.id === id)?.name}`;
}

/* format date like DOW MON DAY */
export const formatDate = (date: Date) => {
	return date.toDateString().slice(0, 10);
}

export const formatAmount = (amount: number | 'Multiple', transfer: boolean) => {
	if (amount === 'Multiple') return 'Multiple';
	return `${transfer !== true ? (amount > 0 ? `+` : `-`) : ''}$${Math.abs(amount / 100).toFixed(2)}`
}

export const formatCategory = (category: Category) => {
	return `${category.split('>')[0].slice(0, 6)}>${category.split('>')[1]/*.slice(0, 8)*/}`;
}

export function addDays(date: Date, days: number) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 0, 0, 0, 0);
}