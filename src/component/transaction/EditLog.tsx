import { invoke } from '@tauri-apps/api/tauri';
import React, { useState, useMemo, useEffect } from 'react';
import {
	Transaction,
	IncomeRoot,
	IncomeLeaf,
	ExpenseRoot,
	ExpenseLeaf,
	getEnumKeys,
	Account,
} from '../../typedef';

interface EditLogProps {
	log: Transaction | null;
	accounts: Account[];
	toggle: () => void;
	cancel: () => void;
	isIncome: boolean;
	updateLog: () => void;
}
export function EditLog({ log, accounts, updateLog, isIncome, toggle, cancel }: EditLogProps) {
	const [company, setCompany] = useState(log ? log.company : '');
	const [amount, setAmount] = useState(log ? String(log.amount / 100) : '0');
	const displayAmount = useMemo(
		() =>
			`${Math.abs(Number(amount))}${amount.charAt(amount.length - 1) === '.' ? '.' : ''}${amount.charAt(amount.length - 2) === '.' && amount.charAt(amount.length - 1) === '0' ? '.0' : ''}`,
		[amount],
	);
	const [category, setCategory] = useState(log ? log.category : '');
	const [date, setDate] = useState(
		log ? log.date : new Date(new Date().toISOString().split('T')[0]),
	);
	const [desc, setDesc] = useState(log ? log.desc : '');

	const [accountId, setAccountId] = useState(
		log ? String(log.account_id) : localStorage.getItem('accountDefault') ?? '',
	);

	const [isIncomeState, setIsIncomeState] = useState(isIncome);
	useEffect(() => setIsIncomeState(isIncome), [isIncome]);

	const accountError = useMemo(
		() =>
			!isIncome
				? accounts.length === 0
					? '*Expense requires a source account'
					: ''
				: accounts.length === 0
					? '*Income requires a destination account'
					: '',
		[isIncome],
	);
	const [error, setError] = useState('');
	useEffect(() => {
		const timer = setTimeout(() => setError(''), 5000);
		return () => clearTimeout(timer);
	}, [error]);

	async function addTransaction() {
		if (company === '') {
			setError('Source/Payee required');
			return;
		}
		if (amount === '0' || accountId === '') {
			setError('Account and amount required');
			return;
		}
		if (category === '') {
			setError('Category required');
			return;
		}

		const balanceAdjustor = Number(amount) < 0 ? (isIncomeState ? -1 : 1) : isIncomeState ? 1 : -1;
		const transactionData = {
			id: log ? log.id : undefined,
			company: company,
			amount: Math.round((Number(amount) + Number.EPSILON) * 100) * balanceAdjustor,
			category: category,
			date: new Date(date.toDateString()),
			desc: desc,
			accountId: accountId,
		};

		if (log !== null) await invoke('fix_transaction', transactionData);
		else await invoke('new_transaction', transactionData);

		updateLog();
		toggle();
	}

	const deleteTransaction = () => {
		if (!log) return;

		invoke('remove_transaction', { id: log.id });
		updateLog();

		const accountData = {
			id: Number(accountId),
			accountType: accounts.find((a) => a.id === accountId)!.account_type,
			accountId: accounts.find((a) => a.id === accountId)!.account_name,
			balance:
				accounts.find((a) => a.id === accountId)!.balance +
				(isIncomeState ? -1 : 1) * Math.round((Number(amount) + Number.EPSILON) * 100),
			date: new Date().toISOString(),
		};
		invoke('fix_account', accountData);
	};

	const updateAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		const am = e.target.value;
		if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
			setAmount(am);
		}
	};

	const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCategory(e.target.value as typeof category);
	};

	return (
		<fieldset
			className={isIncomeState ? 'new-trans new-trans-income' : 'new-trans new-trans-expense'}
		>
			<legend>
				{log ? 'Edit' : 'New'}
				{isIncomeState ? ` Income` : ` Expense`}
			</legend>

			<div className="new-trans-main">
				<li>
					<label>{isIncomeState ? `Source` : `Payee`}: </label>
					<input
						type="text"
						value={company}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
					/>
				</li>
				<li>
					<label>Amount: </label>
					<input type="text" value={displayAmount} onChange={updateAmount} />
				</li>
			</div>

			<li className="new-trans-detail">
				{isIncomeState ? (
					<select value={`${category}`} onChange={handleCategorySelect}>
						<option value="">{`Select Category`}</option>
						{getEnumKeys(IncomeRoot).map((root, index) => (
							<optgroup label={root} key={index}>
								{IncomeLeaf[root].map((leaf, index) => (
									<option key={index} value={`${root}>${leaf}`}>
										{`> ${leaf}`}
									</option>
								))}
							</optgroup>
						))}
					</select>
				) : (
					<select value={`${category}`} onChange={handleCategorySelect}>
						<option value="">{`Select Category`}</option>
						{getEnumKeys(ExpenseRoot).map((root, index) => (
							<optgroup key={index} label={root}>
								{ExpenseLeaf[root].map((leaf, index) => (
									<option key={index} value={`${root}>${leaf}`}>
										{`> ${leaf}`}
									</option>
								))}
							</optgroup>
						))}
					</select>
				)}
				<input
					className="date-pick"
					type="date"
					value={date.toISOString().substring(0, 10)}
					onChange={(e) => {
						setDate(
							new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')),
						);
					}}
				/>
			</li>
			<li>
				<label>{isIncomeState ? 'Destination' : 'Source'}: </label>
				<select
					value={accountId}
					onChange={(e) => {
						setAccountId(e.target.value);
					}}
				>
					<option value="">Select Account</option>
					{accounts.map((a, index) => (
						<option key={index} value={String(a.id)}>
							{a.account_type}:{a.account_name}
						</option>
					))}
				</select>
			</li>

			<li className="new-trans-desc">
				<label>Description: </label>
				<textarea value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
			</li>

			<li className="new-trans-meta">
				<button className="new-trans-submit" onClick={addTransaction}>
					Submit
				</button>
				{log && (
					<button onClick={() => setIsIncomeState(!isIncomeState)}>
						{isIncomeState ? `Expense` : `Income`}
					</button>
				)}
				<button onClick={cancel}>Cancel</button>
				{log && (
					<button className="delete-trans" onClick={deleteTransaction}>
						Delete
					</button>
				)}
			</li>

			{accountError !== '' && (
				<li>
					<>{accountError}</>
				</li>
			)}
			{error !== '' && (
				<li>
					<>{error}</>
				</li>
			)}
		</fieldset>
	);
}
