import { useMemo, useState } from 'react';
import { Transaction, Account } from '../../typedef';
import { getCategoryColor, addDays } from '../../typeassist';
import ViewLog from '../transaction/ViewLog';
import '../../styles/List.css';
import EditMultiLog from '../transaction/EditMultiLog';

interface ListProps {
	transactions: Transaction[];
	accounts: Account[];
	updateLog: () => void;
	showFilter: boolean;
	incRange: () => void;
	signalRefresh: () => void;
}
export default function List({
	transactions,
	accounts,
	updateLog,
	showFilter,
	incRange,
	signalRefresh,
}: ListProps) {

	const logs = useMemo(() => {
		const ret = transactions.filter((t) => !['Transfer', 'Credit'].includes(t.category.split('>')[1]));
		const rela = transactions.filter((t) => ['Transfer', 'Credit'].includes(t.category.split('>')[1]));
		
		const rel = rela.map((t) => {
			const amt = t.amount;
			const rel_t = rela.find((rt) => rt.amount === -amt);
			if (rel_t) {
				const acct = accounts.find(a => a.id === rel_t.account_id);
				rela.splice(rela.indexOf(rel_t), 1);
				return {
					id: t.id,
					date: t.date,
					amount: amt,
					category: t.category,
					desc: t.desc,
					account_id: t.account_id,
					company: acct ? `${acct.account_type.slice(0, 5)}:${acct.account_name}` : t.company,
				} as Transaction;
			}
			return null;
		}).filter((t) => t !== null) as Transaction[];

		return ret.concat(rel).sort((a, b) => b.date.getTime() - a.date.getTime());
	}, [transactions]);

	const futureTransactions = useMemo(() => {
		return logs.filter((t) => t.date.getTime() > new Date().getTime());
	}, [logs]);

	const pastWeekTransactions = useMemo(() => {
		const weekAgo = addDays(new Date(), -6);
		return logs.filter(
			(t) => t.date.getTime() >= weekAgo.getTime() && !futureTransactions.includes(t),
		);
	}, [logs, futureTransactions]);

	const pastMonthTransactions = useMemo(() => {
		const monthAgo = addDays(new Date(), -29);
		return logs.filter(
			(t) =>
				t.date.getTime() >= monthAgo.getTime() &&
				!futureTransactions.includes(t) &&
				!pastWeekTransactions.includes(t),
		);
	}, [logs, futureTransactions, pastWeekTransactions]);

	const past90DTransactions = useMemo(() => {
		const yearAgo = addDays(new Date(), -89);
		return logs.filter(
			(t) =>
				t.date.getTime() >= yearAgo.getTime() &&
				!futureTransactions.includes(t) &&
				!pastMonthTransactions.includes(t) &&
				!pastWeekTransactions.includes(t),
		);
	}, [logs, futureTransactions, pastWeekTransactions, pastMonthTransactions]);

	const otherTransactions = useMemo(() => {
		return logs.filter(
			(t) =>
				!pastMonthTransactions.includes(t) &&
				!futureTransactions.includes(t) &&
				!pastWeekTransactions.includes(t) &&
				!past90DTransactions.includes(t),
		);
	}, [logs, futureTransactions, pastWeekTransactions, pastMonthTransactions, past90DTransactions]);

	/* recombine subsections of transactions into one array */
	const allTransactions: Transaction[][] = useMemo(
		() => [
			futureTransactions,
			pastWeekTransactions,
			pastMonthTransactions,
			past90DTransactions,
			otherTransactions,
		],
		[
			futureTransactions,
			pastWeekTransactions,
			pastMonthTransactions,
			past90DTransactions,
			otherTransactions,
		],
	);

	const transactionTitles = ['Upcoming', '7 Days', '30 Days', '90 Days', 'Previous'];
	const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
	const updateSelected = (transaction: Transaction) => {
		if (selectedTransactions.includes(transaction))
			setSelectedTransactions(
				selectedTransactions.filter((t) => JSON.stringify(t) !== JSON.stringify(transaction)),
			);
		else setSelectedTransactions([...selectedTransactions, transaction]);
	};

	const [showIndices, setShowIndices] = useState(
		sessionStorage
			.getItem('list.indices')
			?.split(' ')
			.map((i) => Number(i)) ?? [0, 1],
	);
	const handleIndexToggle = (index: number) => {
		if (showIndices.includes(index)) {
			const indices = showIndices.filter((i) => i !== index);
			setShowIndices(indices);
			sessionStorage.setItem('list.indices', indices.join(' '));
		} else {
			const indices = [...showIndices, index];
			setShowIndices(indices);
			sessionStorage.setItem('list.indices', indices.join(' '));
		}
	};

	const [editLogs, setEditLogs] = useState<string[]>([]); // list of transaction ids to edit
	const handleEditSelect = (id: string) => {
		if (editLogs.includes(id)) setEditLogs(editLogs.filter((e) => e !== id));
		else setEditLogs([...editLogs, id]);
	};

	return (
		<div className={showFilter ? 'main-down-shift page-main' : 'page-main'}>
			{editLogs.length > 0 && (
				<EditMultiLog
					editLogs={editLogs}
					logs={logs}
					accounts={accounts}
					cancel={() => setEditLogs([])}
					refresh={signalRefresh}
				/>
			)}

			{allTransactions.map((transactionCollection, ind) => (
				<ol
					className={
						'list-main' +
						(ind !== transactionTitles.length - 1 && transactionCollection.length === 0
							? ' list-hide'
							: '')
					}
					key={ind}
				>
					<h2 onClick={() => handleIndexToggle(ind)}>
						{transactionTitles[ind]}
						<img src={showIndices.includes(ind) ? '/double-down.svg' : '/double-left.svg'} />
					</h2>

					{showIndices.includes(ind) ? (
						transactionCollection.length > 0 ? (
							transactionCollection.map((transaction) => (
								<li
									key={transaction.id}
									className={
										'item-base' + (editLogs.includes(transaction.id) ? ' edit-list-active' : '')
									}
								>
									<input
										type="checkbox"
										className="list-checkbox"
										checked={editLogs.includes(transaction.id)}
										onChange={() => handleEditSelect(transaction.id)}
									/>

									<div
										className={
											(transaction.amount < 0 ? 'list-item-expense' : 'list-item-income') +
											' list-item' + (['Transfer', 'Credit'].includes(transaction.category.split('>')[1]) ? ' list-item-transfer' : '')
										}
										onClick={() => updateSelected(transaction)}
									>
										<span className="list-item-date">
											{transaction.date.toDateString().split(' ').slice(0, 3).join(' ')}
										</span>
										<span className="list-item-source"> {transaction.company}</span>
										<span className="list-item-amount">
											{' '}
											{ ['Transfer', 'Credit'].includes(transaction.category.split('>')[1]) ? ('$') : (transaction.amount < 0 ? `-$` : `+$`) }
											{Math.abs(transaction.amount / 100).toFixed(2)}
										</span>
										<span
											className="list-item-category"
											style={{ backgroundColor: getCategoryColor(transaction.category) }}
										>
											{transaction.category.split('>')[1]
												? `${transaction.category.split('>')[0].slice(0, 6)}>${transaction.category.split('>')[1].slice(0, 9)}`
												: `${transaction.category.slice(0, 18)}`}
										</span>
										<span className="list-item-desc"> - {transaction.desc}</span>
										<span className="list-item-account">{`${accounts.find((a) => a.id === transaction.account_id)?.account_type.slice(0, 5)}:${accounts.find((a) => a.id === transaction.account_id)?.account_name}`}</span>
									</div>
								</li>
							))
						) : (
							<li>No transactions</li>
						)
					) : null}

					{ind === transactionTitles.length - 1 &&
						showIndices.includes(transactionTitles.length - 1) && (
							<button
								onClick={() => {
									incRange();
									signalRefresh();
								}}
								className="fetch-more"
							>
								Load 90 Days ({Number(sessionStorage.getItem('fetchRange') ?? 89) + 91})
							</button>
						)}
				</ol>
			))}

			{logs.length === 0 && (
				<ol key={'empty'} className="list-main">
					No transactions found
				</ol>
			)}

			{selectedTransactions.length > 0 &&
				selectedTransactions.map((trans) => (
					<ViewLog
						key={`${trans.id}:viewlog`}
						transaction={trans}
						accounts={accounts}
						toggle={() =>
							setSelectedTransactions(
								selectedTransactions.filter((t) => JSON.stringify(t) !== JSON.stringify(trans)),
							)
						}
						updateLog={updateLog}
					/>
				))}
		</div>
	);
}
