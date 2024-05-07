import { Transaction, Account } from '../../typedef';
import { useMemo } from 'react';
import ZoomChart from './ZoomChart';
import { titleOptions } from './graph';

interface GraphProps {
	transactions: Transaction[];
	accounts: Account[];
  full: boolean;
  toggleFull: () => void;
}
export default function Sankey({ transactions, accounts, full, toggleFull }: GraphProps) {

	const categoryTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		transactions.forEach((t) => {
			if (totals[t.category] === undefined) totals[t.category] = 0;
			totals[t.category] += Math.round(t.amount / 100);
		});
		totals;
		return totals;
	}, [transactions]);

	const categories = useMemo(
		() => Object.keys(categoryTotals).sort((a, b) => categoryTotals[a] - categoryTotals[b]),
		[categoryTotals],
	);

	const isCycle = useMemo(() => {
		let ret = false;
		const transfers = transactions.filter(
			(t) => t.category.split('>').length > 1 && ['Transfer'].includes(t.category.split('>')[1]),
		);
		const direction: { [key: string]: number } = {};
		transfers.forEach((t) => {
			if (direction[t.account_id] === undefined) direction[t.account_id] = t.amount > 0 ? 1 : -1;
			else if (direction[t.account_id] !== (t.amount > 0 ? 1 : -1)) ret = true;
		});
		return ret;
	}, [transactions]);

	const nodes = useMemo(() => {
		const ids = transactions.map((t) => t.account_id);
		const accts = accounts.filter((a) => ids.includes(a.id));

		const ret = accts
			.map(
				(a) =>
					new Object({
						name: `${a.type}:${a.name}`,
					}),
			)
			.concat(
				categories
					.filter(
						(c) =>
							c.split('>').length > 1 &&
							!(isCycle ? ['Credit'] : ['Transfer', 'Credit']).includes(c.split('>')[1]),
					)
					.map((c) => new Object({ name: c })),
			);

		return ret;
	}, [accounts, categories]);
	const links = useMemo(() => {
		type Link = { source: string; target: string; value: number };

		const ret: Link[] = transactions
			.filter(
				(t) =>
					t.category.includes('>') && !['Transfer', 'Credit'].includes(t.category.split('>')[1]),
			)
			.map((t) => {
				const acct = accounts.find((a) => a.id === t.account_id)!;

				return new Object({
					source: t.amount > 0 ? t.category : `${acct.type}:${acct.name}`,
					target: t.amount > 0 ? `${acct.type}:${acct.name}` : t.category,
					value: Math.abs(t.amount / 100),
				}) as Link;
			});

		const connect: Link[] = transactions
			.filter(
				(t) =>
					t.category.split('>')[0] === 'Financial' &&
					t.category.split('>').length > 1 &&
					(isCycle ? ['Credit'] : ['Transfer', 'Credit']).includes(t.category.split('>')[1]),
			)
			.map((t) => {
				const acct = accounts.find((a) => a.id === t.account_id)!;
				return new Object({
					source: `${acct.type}:${acct.name}`,
					target: t.category,
					value: Math.abs(t.amount / 100),
				}) as Link;
			});
		transactions
			.filter(
				(t) =>
					t.category.split('>')[0] === 'FinanceIncome' &&
					t.category.split('>').length > 1 &&
					['Transfer', 'Credit'].includes(t.category.split('>')[1]),
			)
			.forEach((t) => {
				const acct = accounts.find((a) => a.id === t.account_id)!;

				const link = connect.find(
					(c: Link) =>
						c.value === Math.abs(t.amount / 100) &&
						c.target.split('>')[1] === t.category.split('>')[1],
				);
				if (link) link.target = `${acct.type}:${acct.name}`;
				else
					connect.push(
						new Object({
							source: t.category,
							target: `${acct.type}:${acct.name}`,
							value: Math.abs(t.amount / 100),
						}) as Link,
					);
			});
		if (isCycle) {
			transactions
				.filter(
					(t) =>
						t.category.split('>')[0] === 'Financial' &&
						t.category.split('>').length > 1 &&
						['Transfer'].includes(t.category.split('>')[1]),
				)
				.forEach((t) => {
					const acct = accounts.find((a) => a.id === t.account_id)!;
					connect.push(
						new Object({
							source: `${acct.type}:${acct.name}`,
							target: t.category,
							value: Math.abs(t.amount / 100),
						}) as Link,
					);
				});
		}

		return ret.concat(connect);
	}, [transactions, categories, accounts]);

	const option = {
		title: titleOptions('Asset Allocation', full),
		tooltip: {
			trigger: 'item',
			triggerOn: 'mousemove',
			formatter: '<em>{b}</em> : <b>${c}</b>',
		},
		width: full ? '81%' : '75%',
		height: full ? '75%' : '87%',
		series: [
			{
				type: 'sankey',
				emphasis: {
					focus: 'adjacency',
				},
				nodeAlign: 'right',
				top: full ? '13%': '10%',
				left: '3%',
				bottom: '5%',
				label: {
					color: full ? '#fff' : '#333',
					fontSize: full ? 16 : 12,
					textBorderColor: full ? '#000' : '#fff',
					textBorderType: 'solid',
					textBorderWidth: 1,
				},

				data: nodes,
				links: links,
				lineStyle: {
					color: 'source',
					curveness: 0.4,
					opacity: full ? .5 : 0.24,
				},
				itemStyle: {
					opacity: full ? .85 : 0.68,
				},
				levels: [
					{
						depth: 0,
						itemStyle: {
							color: '#739d88',
						},
						lineStyle: {
							color: 'source',
							curveness: 0.4,
						},
					},
					{
						depth: 1,
						itemStyle: {
							color: '#a0bacb',
						},
						lineStyle: {
							color: 'target',
							curveness: 0.4,
						},
					},
					{
						depth: 2,
						itemStyle: {
							color: full ? '#d1b690' : `#D8AA69`,
						},
						lineStyle: {
							color: 'gradient',
							curveness: 0.4,
						},
					},
				],
			},
		],
	};

	return (
		<ZoomChart full={full} toggleFull={toggleFull} option={option} />
	);
}
