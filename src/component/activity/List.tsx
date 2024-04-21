import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Transaction, Account } from '../../typedef';
import { getCategoryColor } from '../../typeassist';
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
	more: boolean;
	restrictAcct: boolean;
}
export default function List({
	transactions,
	accounts,
	updateLog,
	showFilter,
	incRange,
	signalRefresh,
	more,
	restrictAcct,
}: ListProps) {
	const [sortBy, setSortBy] = useState('date');
	const handleSort = (val: string) => {
		if (val === sortBy) {
			setSortBy(`!${val}`);
		} else {
			setSortBy(val);
		}
	};

	const logs = useMemo(() => {
		let ret = restrictAcct
			? transactions
			: transactions.filter((t) => !['Transfer', 'Credit'].includes(t.category.split('>')[1]));

		if (!restrictAcct) {
			const rela = transactions.filter((t) =>
				['Transfer', 'Credit'].includes(t.category.split('>')[1]),
			);
			const rel = rela
				.map((t) => {
					const amt = t.amount;
					const rel_t = rela.find((rt) => rt.amount === -amt);
					if (rel_t) {
						const acct = accounts.find((a) => a.id === rel_t.account_id);
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
				})
				.filter((t) => t !== null) as Transaction[];
			ret = ret.concat(rel);
		}

		ret = ret.sort((a, b) => {
			switch (sortBy) {
				case 'date':
					return b.date.getTime() - a.date.getTime();
				case '!date':
					return a.date.getTime() - b.date.getTime();
				case 'amount':
					return Math.abs(b.amount) - Math.abs(a.amount);
				case '!amount':
					return Math.abs(a.amount) - Math.abs(b.amount);
				case 'type': {
					if (['Transfer', 'Credit'].includes(a.category.split('>')[1])) return 1;
					return b.amount - a.amount;
				}
				case '!type': {
					if (['Transfer', 'Credit'].includes(a.category.split('>')[1])) return -1;
					return a.amount - b.amount;
				}
				case 'store':
					return a.company.localeCompare(b.company);
				case '!store':
					return b.company.localeCompare(a.company);
				case 'category':
					return a.category.localeCompare(b.category);
				case '!category':
					return b.category.localeCompare(a.category);
				case 'account':
					return a.account_id.localeCompare(b.account_id);
				case '!account':
					return b.account_id.localeCompare(a.account_id);
				default:
					return b.date.getTime() - a.date.getTime();
			}
		});
		return ret;
	}, [transactions, accounts, sortBy]);

	const [perPage, setPerPage] = useState(
		localStorage.getItem('list.perPage') !== null
			? Number(localStorage.getItem('list.perPage'))
			: 50,
	);
	const [page, setPage] = useState(0);

	const curView = useMemo(
		() => logs.slice(page * perPage, page * perPage + perPage),
		[logs, page, perPage],
	);

	const topMenu = useRef<HTMLDivElement>(null);
	const scrollBehavior = useRef<ScrollBehavior>('instant');
	useEffect(() => {
		topMenu.current?.scrollIntoView({ behavior: scrollBehavior.current });
		scrollBehavior.current = 'smooth';
	}, [page]);

	const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
	const updateSelected = (transaction: Transaction) => {
		if (selectedTransactions.includes(transaction) || editLogs.includes(transaction.id)) {
			setSelectedTransactions(
				selectedTransactions.filter((t) => JSON.stringify(t) !== JSON.stringify(transaction)),
			);
			setEditLogs(editLogs.filter((e) => e !== transaction.id));
		} else {
			const selected = selectedTransactions
				.map((t) => t.id)
				.concat(editLogs)
				.concat([transaction.id]);
			if (selected.length > 1) {
				setEditLogs(selected);
				setSelectedTransactions([]);
			} else setSelectedTransactions([...selectedTransactions, transaction]);
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

			<menu className="list-view-options">
				<div className="list-sort">
					<h5>Sort:</h5>
					<button
						onClick={() => handleSort('date')}
						className={sortBy.includes('date') ? 'active-sort-filter' : ''}
					>
						<img src={sortBy === 'date' ? '/sort-up.svg' : '/sort-down.svg'} />
						Date
					</button>
					<button
						onClick={() => handleSort('store')}
						className={sortBy.includes('store') ? 'active-sort-filter' : ''}
					>
						<img src={sortBy === 'store' ? '/sort-z-a.svg' : '/sort-a-z.svg'} />
						Store
					</button>
					<button
						onClick={() => handleSort('amount')}
						className={sortBy.includes('amount') ? 'active-sort-filter' : ''}
					>
						<img src={sortBy === 'amount' ? '/sort-up.svg' : '/sort-down.svg'} />
						Amount
					</button>
					<button
						onClick={() => handleSort('category')}
						className={sortBy.includes('category') ? 'active-sort-filter' : ''}
					>
						<img src={sortBy === 'category' ? '/sort-z-a.svg' : '/sort-a-z.svg'} />
						Category
					</button>
					<button
						onClick={() => handleSort('type')}
						className={sortBy.includes('type') ? 'active-sort-filter' : ''}
					>
						<img src="/sort.svg" />
						Type
					</button>
					<button
						onClick={() => handleSort('account')}
						className={sortBy.includes('account') ? 'active-sort-filter' : ''}
					>
						<img src={sortBy === 'account' ? '/sort-z-a.svg' : '/sort-a-z.svg'} />
						Account
					</button>
				</div>
			</menu>

			<div className="list-menu-container" ref={topMenu}>
				<ListMenu
					logs={logs}
					page={page}
					perPage={perPage}
					setPage={setPage}
					setPerPage={setPerPage}
				/>
			</div>

			<ol className="list-main">
				{curView.map((transaction) => (
					<li
						key={transaction.id}
						className={'item-base' + (editLogs.includes(transaction.id) ? ' edit-list-active' : '')}
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
								' list-item' +
								(['Transfer', 'Credit'].includes(transaction.category.split('>')[1])
									? ' list-item-transfer'
									: '')
							}
							onClick={() => updateSelected(transaction)}
						>
							<span className="list-item-date">
								{transaction.date.toDateString().split(' ').slice(0, 3).join(' ')}
							</span>
							<span className="list-item-source"> {transaction.company}</span>
							<span className="list-item-amount">
								{' '}
								{['Transfer', 'Credit'].includes(transaction.category.split('>')[1])
									? '$'
									: transaction.amount < 0
										? `-$`
										: `+$`}
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
				))}

				{curView.length === 0 && <div className="empty-list">No transactions found</div>}

				{more && page >= Math.floor(logs.length / perPage) && (
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

			<ListMenu
				logs={logs}
				page={page}
				perPage={perPage}
				setPage={setPage}
				setPerPage={setPerPage}
			/>

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

interface ListMenuProps {
	logs: Transaction[];
	page: number;
	perPage: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	setPerPage: React.Dispatch<React.SetStateAction<number>>;
}
function ListMenu({ logs, page, perPage, setPage, setPerPage }: ListMenuProps) {
	const handlePage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const am = e.target.value;
		if (!am) {
			setPage(0);
		} else if (am.match(/^\d{1,}?$/)) {
			const newPage = Math.max(0, Number(am) - 1);
			if (newPage <= Math.floor(logs.length / perPage)) setPage(newPage);
		}
	};

	return (
		<menu className="list-view-options">
			<div className="list-menu-opt">
				<button onClick={() => setPage(page - 1)} disabled={page <= 0}>
					<img src="/left-arrow.svg" />
				</button>
				<input type="text" value={`${page + 1}`} onChange={handlePage} />
				<span>{` / ${Math.floor(logs.length / perPage) + 1}`} </span>
				<button
					onClick={() => setPage(page + 1)}
					disabled={page >= Math.floor(logs.length / perPage)}
				>
					<img src="/right-arrow.svg" />
				</button>
			</div>

			<div className="list-menu-opt">
				<label htmlFor="perpage">Per page: </label>
				<select
					id="perpage"
					value={perPage}
					onChange={(e) => {
						localStorage.setItem('list.perPage', e.target.value);
						setPerPage(Number(e.target.value));
						setPage(Math.min(page, Math.floor(logs.length / Number(e.target.value))));
					}}
				>
					<option value={25}>25</option>
					<option value={50}>50</option>
					<option value={100}>100</option>
					<option value={250}>250</option>
				</select>
			</div>
		</menu>
	);
}
