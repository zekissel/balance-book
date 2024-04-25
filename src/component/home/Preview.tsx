import { useState, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
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
					<button id={curView === AccountType.Checking ? 'preview-type-active' : ''} onClick={() => handleType(AccountType.Checking)}>Checking</button>
					<button id={curView === AccountType.Credit ? 'preview-type-active' : ''} onClick={() => handleType(AccountType.Credit)}>Credit</button>
					<button id={curView === AccountType.Savings ? 'preview-type-active' : ''} onClick={() => handleType(AccountType.Savings)}>Savings</button>
					<button id={curView === AccountType.Investment ? 'preview-type-active' : ''} onClick={() => handleType(AccountType.Investment)}>Investment</button>
					<button id={curView === AccountType.Loan ? 'preview-type-active' : ''} onClick={() => handleType(AccountType.Loan)}>Loan</button>
				</menu>

				<menu>
				{ curView &&
					focusAccounts.map((a) => (
						<button key={a.id} id={curID === a.id ? 'preview-type-active' : ''} onClick={() => handleID(a.id)}>{a.account_name}</button>
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

				{ curID === '' && curView && <AccountGraph accounts={focusAccounts} transactions={transactions} /> }

				{ curID !== '' && recentTransactions.length === 0 ? <span>No recent transactions</span> : null }
			</ol>
		</div>
	);
}

interface AccountGraphProps {
	accounts: Account[];
	transactions: Transaction[];
}
function AccountGraph({ accounts, transactions }: AccountGraphProps) {

	const range = 30;

	interface SeriesDay {
		date: Date;
		total: number;
		name: string;
	}
	const timeFrameTotals: SeriesDay[][] = useMemo(() => {

		let ret: SeriesDay[][] = [];

		for (const account of accounts) {
			const today = new Date(new Date().toDateString());
			const totals: SeriesDay[] = Array.from({ length: range + 1 }, (_, i) => {
				return { date: addDays(today, -i), total: account.balance, name: account.account_name };
			});
			const minTime = addDays(today, -range).getTime();

			transactions.filter(t => t.account_id === account.id).forEach((trans) => {
				if (trans.date.getTime() >= minTime) {
					let index = totals.findIndex((t) => t.date.toDateString() === trans.date.toDateString());
					if (index !== -1) {
						while (index < range) {
							index += 1;
							totals[index].total +=
								(account.account_type !== AccountType.Credit ? -1 : 1) * trans.amount;
						}
					} else if (trans.date.getTime() > today.getTime()) {
						index = range;
						while (index > -1) {
							totals[index].total += (trans.account_id === account.id ? -1 : 1) * trans.amount;
							index -= 1;
						}
					}
				}
			});

			ret.push(totals.sort((a, b) => a.date.getTime() - b.date.getTime()));
		}
		return ret;
	}, [transactions, accounts]);

	const option = /*useMemo(() => */{
		//return new Object({
		color: ['#739d88', '#abc', '#428f68', '#4d7cab'],
		tooltip: {
			trigger: 'item',
			axisPointer: { type: 'line' },
			formatter: '<b>{b}</b><br/>${c}',
		},
		grid: { show: true, top: 20, left: 10, containLabel: true },
		xAxis: {
			type: 'category',
			interval: 0,
			data: timeFrameTotals.length > 0 ? timeFrameTotals[0].map(
				(t) => new Object({ value: t.date.toDateString().slice(4, 10), label: { show: true } }),
			) : [],
			axisLabel: {
				rotate: 20,
				interval: 4,
			},
			splitLine: { show: true, lineStyle: { color: '#ffffff' } },
		},
		yAxis: {
			type: 'value',
			splitLine: { show: true, lineStyle: { color: '#ffffff' } },
		},
		series: timeFrameTotals.map((t) =>
			new Object({
				name: t[0].name,
				type: 'line',
				step: 'end',
				data: t.map((t, i) => {
					return new Object({
						value: t.total / 100,
						label: {
							show: i % 3 == 0,
							position: i % 2 == 0 ? 'top' : 'bottom',
							formatter: '${c}',
						},
					})
				})
			}),
		),
		title: {
			text: 'Account Balances',
			top: -4,
		},
		legend: {
			data: timeFrameTotals.map((t) => t[0].name),
		},
		width: '95%',
		height: '92%',
		dataZoom: { type: 'inside' },
	}//)}, [timeFrameTotals]);


	return (
		<div className='stats-graph'>
			<ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
		</div>
	)
}