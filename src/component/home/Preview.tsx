import { useState, useMemo } from 'react';
import { Account, AccountType, Transaction } from '../../typedef';
import { addDays } from '../../typeassist';

interface PreviewProps {
	accounts: Account[];
	transactions: Transaction[];
}
export default function Preview({ accounts, transactions }: PreviewProps) {
	const [curView, setCurView] = useState<AccountType | null>(null);
	const [curID, setCurID] = useState('');

	const focusAccounts = useMemo(() => {
		return accounts.filter((a) => a.account_type === curView);
	}, [curView]);

	const recentTransactions = useMemo(() => {
		const minDate = addDays(new Date(), -3);
		const ret = transactions.filter((t) => t.account_id === curID);
		return ret.filter((t) => t.date.getTime() >= minDate.getTime()).sort((a, b) => b.date.getTime() - a.date.getTime());
	}, [transactions, curID]);

	const handleType = (type: AccountType) => {
		if (curView === type)  setCurView(null);
		else  setCurView(type);
		setCurID('');
	}

	const handleID = (id: string) => {
		if (curID === id)  setCurID('');
		else  setCurID(id);
	}

	return (
		<div className="home-preview">
			<div className='preview-acct-select'>
				
				<menu>
					<button className={curView === AccountType.Checking ? 'preview-type-active' : ''} onClick={() => handleType(AccountType.Checking)}>Checking</button>
					<button className={curView === AccountType.Credit ? 'preview-type-active' : ''} onClick={() => handleType(AccountType.Credit)}>Credit</button>
					<button className={curView === AccountType.Savings ? 'preview-type-active' : ''} onClick={() => handleType(AccountType.Savings)}>Savings</button>
					<button className={curView === AccountType.Investment ? 'preview-type-active' : ''} onClick={() => handleType(AccountType.Investment)}>Investment</button>
					<button className={curView === AccountType.Loan ? 'preview-type-active' : ''} onClick={() => handleType(AccountType.Loan)}>Loan</button>
				</menu>

				<menu>
				{ curView &&
					focusAccounts.map((a) => (
						<button key={a.id} className={curID === a.id ? 'preview-type-active' : ''} onClick={() => handleID(a.id)}>{a.account_name}</button>
					))
				}

				{ curView && focusAccounts.length === 0 &&
					<div>No accounts of this type</div>
				}

				{ !curView &&
					<div>Select account type</div>
				}
				</menu>
			</div>

			<ol>
				{recentTransactions
					.filter((t) => t.account_id === curID)
					.map((t) => (
						<li key={t.id}>
							${t.amount / 100} {t.company}
						</li>
					))}

				{ curID !== '' && recentTransactions.length === 0 ? <span>No recent transactions</span> : null }
			</ol>
		</div>
	);
}
