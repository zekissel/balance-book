import { invoke } from '@tauri-apps/api/tauri';
import { ExpenseRoot, IncomeRoot, Transaction, Account, Category } from './typedef';

// prettier-ignore
export const getCategoryColor = (category: Category): string => {
	let color = '#fff';
	switch (category.split('>')[0]) {
		case ExpenseRoot.Home: color = `#F5E890`; break;
		case ExpenseRoot.Utilities: color = `#C2F3FA`; break;
		case ExpenseRoot.Entertainment: color = `#F9C9C9`; break;
		case ExpenseRoot.Financial: color = `#E6C9F9`; break;
		case ExpenseRoot.Food: color = `#F9C9ED`; break;
		case ExpenseRoot.Studio: color = `#B0CCF0`; break;
		case ExpenseRoot.Other: color = `#C9F9E6`; break;
		case ExpenseRoot.Personal: color = `#F9E6C9`; break;
		case ExpenseRoot.Healthcare: color = `#F9C9C9`; break;
		case ExpenseRoot.Services: color = `#F9F1C9`; break;
		case ExpenseRoot.Transport: color = `#E3AEFF`; break;
		case ExpenseRoot.Travel: color = `#BEF7F6`; break;

		case IncomeRoot.Salary: color = `#F5C0DB`; break;
		case IncomeRoot.SideJob: color = `#BAF5DB`; break;
		case IncomeRoot.Government: color = `#F5D3BA`; break;
		case IncomeRoot.FinanceIncome: color = `#E0ABFC`; break;
		case IncomeRoot.OtherIncome: color = `#F0A2B2`; break;

		default: return '#fff';
	}
  if (category.split('>')[1] === undefined) return `${color}`;
  else {
    switch (category.split('>')[1].length) {
      case 2: return `${color}77`;
      case 3: return `${color}88`;
      case 4: return `${color}99`;
      case 5: return `${color}AA`;
      case 6: return `${color}BB`;
      case 7: return `${color}CC`;
      case 8: return `${color}DD`;
      case 9: return `${color}EE`;
      case 10: return `${color}FF`;
      
      default: return `${color}`
    }
  }
};

export function addDays(date: Date, days: number) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 0, 0, 0, 0);
}

export function addHours(date: Date, hours: number) {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		date.getHours() + hours,
		0,
		0,
		0,
	);
}

export async function getTransactions(
	account_ids: string[],
	range: number,
): Promise<[Transaction[], boolean]> {
	const startDate = addDays(new Date(), -range).toISOString().split('T')[0];
	return await invoke('get_transactions', { accountId: account_ids, start: startDate }).then(
		(data) => {
			const [trans, more] = data as [Transaction[], boolean];
			trans.forEach((t) => {
				t.date = addDays(
					new Date(new Date(t.date).toUTCString().split(' ').slice(0, 4).join(' ')),
					0,
				);
			});
			return [trans.sort((a, b) => (a.date > b.date ? -1 : 1)), more];
		},
	);
}

export async function getAccounts(user_id: string): Promise<Account[]> {
	return await invoke('get_accounts', { userId: user_id }).then((data) => {
		const acc = data as Account[];
		//acc.forEach((e) => (e.date = new Date(e.date)));
		return acc.sort((a, b) => (a.date > b.date ? -1 : 1));
	});
}

export function generateChartColor(index: number, isIncome: boolean) {
	const incomeColors = ['#739d88', '#86C4A5', '#9CFACB', '#BADACA', '#50A47A', '#42C483'];
	const expenseColors = ['#f6d6aa', '#D8AA69', '#AB8755', '#E8AD5A', '#DAC25F', '#FADC65'];
	return isIncome
		? incomeColors[index % incomeColors.length]
		: expenseColors[index % expenseColors.length];
}
