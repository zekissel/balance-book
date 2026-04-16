import { invoke } from "@tauri-apps/api/core";

export interface User {
  id: string;
  name: string;
}

export interface Account {
	id: string;
	balance: number;
	timestamp: string;
	name: string;
	category: string;
	userId: string;
}

export interface Transaction {
	id: string;
	amount: number;
	timestamp: string;
	store: string;
	category: string;
	description: string;
	accountId: string;
}

export interface Filters {
	type_: 'income' | 'expense' | 'transfer';
	start_date: Date | null;
	end_date: Date | null;
  store: string[];
	category: string[];
	low_amount: number;
	high_amount: number;
	account: string[];
}

export interface Index {
	current: number;
	size: number;
	field: string;
	order: boolean;
}

export async function getUsers (): Promise<User[]> {
	return await invoke('read_users').then((data) => {
		const users = data as User[];
		return users;
	});
}

export async function getAccounts (): Promise<Account[]> {

	if (location.pathname.split('/').length < 3) return [];
	return await invoke('read_accounts', { user_id_i: location.pathname.split('/')[2] }).then((data) => {
		const accounts = data as Account[];
		return accounts;
	});
}


export async function getTransactions (account_id_i: string[]): Promise<Transaction[]> {
	return await invoke('read_transactions', { account_id_i }).then((data) => {
		const trans = data as Transaction[];
		console.log('trans: ', trans);
		return trans;
	});
}
