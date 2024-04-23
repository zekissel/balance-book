export interface User {
	id: string;
	uname: string;
	email: string | null;
	fname: string | null;
	lname: string | null;
	dob: Date | null;
	plaid_id: string | null;
	plaid_secret: string | null;
}

export enum DataState {
	Loading,
	Success,
	Error,
}

export function getEnumKeys<T extends string, TEnumValue extends string | number>(enumVariable: {
	[key in T]: TEnumValue;
}) {
	return Object.keys(enumVariable) as Array<T>;
}

export enum ExpenseRoot {
	Home = 'Home',
	Utilities = 'Utilities',
	Food = 'Food',
	Transport = 'Transport',
	Healthcare = 'Healthcare',
	Personal = 'Personal',
	Services = 'Services',
	General = 'General',
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

export enum IncomeRoot {
	Salary = 'Salary',
	SideJob = 'SideJob',
	Government = 'Government',
	FinanceIncome = 'FinanceIncome',
	OtherIncome = 'OtherIncome',
};
export const IncomeLeaf = {
	Salary: ['Monthly', 'Bi-Weekly', 'Weekly', 'Other'],
	SideJob: ['Gig', 'Freelance', 'Other'],
	Government: ['Welfare', 'Unemployment', 'Pension', 'Taxes', 'Other'],
	FinanceIncome: ['Transfer', 'Credit', 'Interest', 'Loan', 'Other'],
	OtherIncome: ['Reimbursement', 'Refund', 'Gifts', 'Other'],
};

export type Category = `${IncomeRoot | ExpenseRoot}>${string}`;

export interface Transaction {
	id: string;
	company: string;
	amount: number;
	category: Category;
	date: Date;
	desc: string;
	account_id: string;
}

export interface Day {
	date: Date;
	transactions: Transaction[];
}

export const Month = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export interface Account {
	id: string;
	user_id: string;
	account_type: AccountType;
	account_name: string;
	balance: number;
	date: string;
}

export enum AccountType {
	Checking = 'Checking',
	Credit = 'Credit',
	Savings = 'Savings',
	Investment = 'Investment',
	Loan = 'Loan',
}

export const filtersActiveStyle = { backgroundColor: `#a0bacb` };
export const menuActiveStyle = {
	backgroundColor: `#93ceb4`,
	color: `#191919`,
};

export interface Filter {
	type: string;
	startDate: Date | null;
	endDate: Date | null;
	category: string[];
	source: string[];
	lowAmount: string;
	highAmount: string;
	accounts: string[];
}

export function anyFiltersActive(filter: Filter): boolean {
	return (
		filter.type !== `all` ||
		filter.startDate !== null ||
		filter.endDate !== null ||
		filter.category.length > 0 ||
		filter.source[0].length > 0 ||
		Number(filter.lowAmount) !== 0 ||
		Number(filter.highAmount) !== 0 ||
		filter.accounts.length > 0
	);
}

export function filterTransactions({
	transactions,
	filters,
}: {
	transactions: Transaction[];
	filters: Filter;
}): Transaction[] {
	let ret: Transaction[] = [];

	if (filters.type === `expense` || filters.type === `all`)
		ret = ret.concat(transactions.filter((t) => t.amount < 0));
	if (filters.type === `income` || filters.type === `all`)
		ret = ret.concat(transactions.filter((t) => t.amount > 0));

	if (filters.startDate !== null)
		ret = ret.filter((t) => t.date.getTime() >= filters.startDate!.getTime());
	if (filters.endDate !== null)
		ret = ret.filter((t) => t.date.getTime() <= filters.endDate!.getTime());

	if (filters.category.length > 0) {
		const exclude = filters.category.includes('X');
		if (!exclude) ret = ret.filter((t) => filters.category.includes(t.category.toString()));
		else ret = ret.filter((t) => !filters.category.includes(t.category.toString()));
	}

	if (filters.source[0].length > 0)
		ret = ret.filter((t) => {
			// match partial names
			const sources = filters.source.map((s: string) => s.toUpperCase().trim());
			return sources.some((s: string) => t.company.toUpperCase().includes(s));
		});

	if (Number(filters.lowAmount) > 0)
		ret = ret.filter((t) => Math.abs(t.amount / 100) >= Number(filters.lowAmount));
	if (Number(filters.highAmount) > 0)
		ret = ret.filter((t) => Math.abs(t.amount / 100) <= Number(filters.highAmount));

	if (filters.accounts.length > 0) {
		const exclude = filters.accounts.includes('X');
		if (!exclude) ret = ret.filter((t) => filters.accounts.includes(t.account_id));
		else ret = ret.filter((t) => !filters.accounts.includes(t.account_id));
	}

	return ret.sort((a, b) => b.date.getTime() - a.date.getTime());
}
