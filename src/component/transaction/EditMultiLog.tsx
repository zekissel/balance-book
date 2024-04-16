import { useState, useMemo } from 'react';
import {
	Transaction,
	IncomeRoot,
	IncomeLeaf,
	ExpenseRoot,
	ExpenseLeaf,
	getEnumKeys,
	Account,
} from '../../typedef';
import { invoke } from '@tauri-apps/api';

interface EditMultiLogProps {
	editLogs: string[];
	logs: Transaction[];
	accounts: Account[];
	cancel: () => void;
	refresh: () => void;
}
export default function EditMultiLog({ editLogs, logs, accounts, cancel, refresh }: EditMultiLogProps) {
	const [editCompany, setEditCompany] = useState<string>('');
	const [editAmount, setEditAmount] = useState('0');
	const [editCategory, setEditCategory] = useState<string>('');
	const [editDate, setEditDate] = useState<Date | null>(null);
	const [editDesc, setEditDesc] = useState<string>('');
	const [editAccount, setEditAccount] = useState<string>('');

	const logConflict = useMemo(() => {
		const trans = logs.filter((l) => editLogs.includes(l.id));
		if (trans.length === 0) return false;

		const isInc = trans[0].amount > 0;
		for (const t of trans) {
			if (t.amount > 0 !== isInc) return true;
		}
		return false;
	}, [editLogs]);
	const isIncome = useMemo(() => {
		if (logConflict) return undefined;
		else {
			const trans = logs.filter((l) => editLogs.includes(l.id));
			return trans[0].amount > 0;
		}
	}, [logs, editLogs, logConflict]);

	const handleSubmitEdit = async () => {
		for (const id of editLogs) {
			const log = {
				id,
				company: editCompany !== '' ? editCompany : logs.find((l) => l.id === id)?.company,
				amount:
					editAmount !== '0'
						? Math.round((Number(editAmount) + Number.EPSILON) * 100) * (isIncome ? 1 : -1)
						: logs.find((l) => l.id === id)?.amount,
				category: editCategory !== '' ? editCategory : logs.find((l) => l.id === id)?.category,
				date: editDate !== null ? editDate : logs.find((l) => l.id === id)?.date,
				desc: editDesc !== '' ? editDesc : logs.find((l) => l.id === id)?.desc,
				accountId: editAccount !== '' ? editAccount : logs.find((l) => l.id === id)?.account_id,
			};

			invoke('fix_transaction', log);
			await new Promise((r) => setTimeout(r, 60));
		}
		refresh();
	};

	const updateAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		const am = e.target.value;
		if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
			setEditAmount(am);
		}
	};
	const displayAmount = useMemo(
		() =>
			`${Math.abs(Number(editAmount))}${editAmount.charAt(editAmount.length - 1) === '.' ? '.' : ''}${editAmount.charAt(editAmount.length - 2) === '.' && editAmount.charAt(editAmount.length - 1) === '0' ? '.0' : ''}`,
		[editAmount],
	);

	const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setEditCategory(e.target.value as typeof editCategory);
	};

	return (
		<menu className="edit-multi-log">
			<span>
				<button onClick={cancel}>
					<img src="/x.svg" />
				</button>
			</span>
			<span>
				Edit {editLogs.length}{' '}
				{isIncome === true ? 'Income(s)' : isIncome === false ? 'Expense(s)' : 'Transactions'}
			</span>

			<label htmlFor="edit-multi-co">Company: </label>
			<input
				type="text"
				id="edit-multi-co"
				placeholder="Company"
				onChange={(e) => setEditCompany(e.target.value)}
			/>

			<label htmlFor="edit-multi-am">Amount: </label>
			<input
				type="text"
				id="edit-multi-am"
				placeholder={'Amount'}
				value={!logConflict ? displayAmount : 'Amount disabled'}
				onChange={updateAmount}
				disabled={logConflict}
			/>

			<label htmlFor="edit-multi-ca">Category: </label>
			{isIncome === true && (
				<select value={`${editCategory}`} onChange={handleCategorySelect}>
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
			)}
			{isIncome === false && (
				<select value={`${editCategory}`} onChange={handleCategorySelect}>
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
			{isIncome === undefined && (
				<input
					type="text"
					id="edit-multi-ca"
					placeholder="Category disabled"
					disabled={logConflict}
				/>
			)}

			<label htmlFor="edit-multi-da">Date: </label>
			<input
				type="date"
				id="edit-multi-da"
				value={editDate?.toISOString().substring(0, 10)}
				onChange={(e) => {
					setEditDate(
						new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')),
					);
				}}
			/>

			<label htmlFor="edit-multi-de">Description: </label>
			<input
				type="text"
				id="edit-multi-de"
				placeholder="Description"
				onChange={(e) => setEditDesc(e.target.value)}
			/>

			<label htmlFor="edit-multi-ac">Account: </label>
			<select
				value={editAccount}
				onChange={(e) => {
					setEditAccount(e.target.value);
				}}
			>
				<option value="">Select Account</option>
				{accounts.map((a, index) => (
					<option key={index} value={String(a.id)}>
						{a.account_type}:{a.account_name}
					</option>
				))}
			</select>

			<button onClick={handleSubmitEdit}>Submit</button>
		</menu>
	);
}
