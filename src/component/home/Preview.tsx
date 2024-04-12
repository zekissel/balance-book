import { useState, useMemo } from 'react';
import { Account, AccountType, Transaction } from '../../typedef';
import { addDays } from '../../typeassist';

interface PreviewProps {
	accounts: Account[];
	transactions: Transaction[];
}
export default function Preview({ accounts, transactions }: PreviewProps) {
	const [curView, setCurView] = useState(AccountType.Checking);
	const [curID, setCurID] = useState(localStorage.getItem('accountDefault') ?? '');

	const recentTransactions = useMemo(() => {
		const minDate = addDays(new Date(), -3);
		const ret = transactions.filter(
			(t) => accounts.find((a) => a.id === t.account_id)?.account_type === curView,
		);
		return ret.filter((t) => t.date >= minDate).sort((a, b) => b.date.getTime() - a.date.getTime());
	}, [transactions, curView]);

	const focusAccounts = useMemo(() => {
		return accounts.filter((a) => a.account_type === curView);
	}, [curView]);
	const curIndex = useMemo(() => {
		return focusAccounts.findIndex((a) => a.id === curID);
	}, [focusAccounts, curID]);

	const handleRadio = (view: AccountType) => {
		setCurView(view);
		setCurID(accounts.find((a) => a.account_type === view)?.id ?? '');
	};
	const seekAccount = (positive: boolean) => {
		const nextIndex = positive ? curIndex + 1 : curIndex - 1;
		setCurID(focusAccounts[nextIndex].id);
	};

	return (
		<div className="home-preview">
			<div>
				<menu>
					<button disabled={curIndex <= 0} onClick={() => seekAccount(false)}>
						&lt;
					</button>
					<button disabled={curIndex >= focusAccounts.length - 1} onClick={() => seekAccount(true)}>
						&gt;
					</button>
				</menu>
				{focusAccounts
					.filter((a) => a.id === curID)
					.map((a) => (
						<div key={a.id}>{a.account_name}</div>
					))}
				<menu>
					<input
						type="radio"
						name="home-account"
						id="check"
						onChange={() => handleRadio(AccountType.Checking)}
					/>
					<label htmlFor="check">Checking</label>
					<input
						type="radio"
						name="home-account"
						id="credit"
						defaultChecked={curView === AccountType.Credit}
						onChange={() => handleRadio(AccountType.Credit)}
					/>
					<label htmlFor="credit">Credit</label>
					<input
						type="radio"
						name="home-account"
						id="save"
						defaultChecked={curView === AccountType.Savings}
						onChange={() => handleRadio(AccountType.Savings)}
					/>
					<label htmlFor="save">Savings</label>
					<input
						type="radio"
						name="home-account"
						id="invest"
						defaultChecked={curView === AccountType.Investment}
						onChange={() => handleRadio(AccountType.Investment)}
					/>
					<label htmlFor="invest">Investing</label>
					<input
						type="radio"
						name="home-account"
						id="loan"
						defaultChecked={curView === AccountType.Loan}
						onChange={() => handleRadio(AccountType.Loan)}
					/>
					<label htmlFor="loan">Loan</label>
				</menu>
			</div>

			<ol>
				{recentTransactions
					.filter((t) => t.account_id === curID)
					.map((t) => (
						<li key={t.id}>
							{t.company} {t.amount}
						</li>
					))}
			</ol>
		</div>
	);
}
