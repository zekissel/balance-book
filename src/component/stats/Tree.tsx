import ZoomChart from './ZoomChart';
import { Transaction } from '../../typedef';
import { useMemo } from 'react';
import { titleOptions } from './graph';

interface GraphProps {
	transactions: Transaction[];
	full: boolean;
	toggleFull: () => void;
}
export default function TreeAlt({ transactions, full, toggleFull }: GraphProps) {

	const incomeTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		transactions
			.filter((t) => t.amount > 0)
			.forEach((t) => {
				if (totals[t.category] === undefined) totals[t.category] = 0;
				totals[t.category] += Math.round(t.amount / 100);
			});
		totals;
		return totals;
	}, [transactions]);

	const incRoots = useMemo(() => {
		const ret = Object.keys(incomeTotals).map((c) => c.split('>')[0].slice(0, 20));
		return [...new Set(ret)];
	}, [incomeTotals]);

	const incLeafs = useMemo(() => {
		const ret = Object.keys(incomeTotals)
			.filter((c) => c.includes('>'))
			.map((c) => (c.split('>')[1] !== 'Other' ? c.split('>')[1] : c));
		return [...new Set(ret)];
	}, [incomeTotals]);

	const expenseTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		transactions
			.filter((t) => t.amount < 0)
			.forEach((t) => {
				if (totals[t.category] === undefined) totals[t.category] = 0;
				totals[t.category] += Math.round(t.amount / 100);
			});
		totals;
		return totals;
	}, [transactions]);

	const expRoots = useMemo(() => {
		const ret = Object.keys(expenseTotals).map((c) => c.split('>')[0].slice(0, 20));
		return [...new Set(ret)];
	}, [expenseTotals]);

	const expLeafs = useMemo(() => {
		const ret = Object.keys(expenseTotals)
			.filter((c) => c.includes('>'))
			.map((c) => (c.split('>')[1] !== 'Other' ? c.split('>')[1] : c));
		return [...new Set(ret)];
	}, [expenseTotals]);

	type TreeData = {
		name: string;
		value: number;
		itemStyle: { color: string };
		children: TreeData[];
	};
	const data = useMemo(() => {
		return {
			name: 'expense',
			value: Object.keys(expenseTotals).reduce((acc, c) => acc + Math.abs(expenseTotals[c]), 0),
			itemStyle: { color: full ? `#d1b690` : `#D8AA69` },
			children: expRoots.map((r) => {
				return {
					name: r,
					value: Object.keys(expenseTotals)
						.filter((c) => c.split('>')[0] === r)
						.reduce((acc, c) => acc + Math.abs(expenseTotals[c]), 0),
					itemStyle: { color: full ? `#d1b690` : `#D8AA69` },
					children: expLeafs
						.map((l) => {
							if (l.includes('>') && l.split('>')[0] !== r) return null;
							const val = Math.abs(expenseTotals[!l.includes('>') ? `${r}>${l}` : `${l}`]) || 0;
							if (val === 0) return null;
							return {
								name: l,
								value: val,
								itemStyle: { color: full ? `#d1b690` : `#D8AA69` },
								children: transactions
									.filter((t) => t.category === (!l.includes('>') ? `${r}>${l}` : l))
									.sort((a,b) => a.store.localeCompare(b.store))
									.map((t) => {
										return {
											name: t.store,
											value: Math.abs(t.amount / 100),
											itemStyle: { color: full ? `#d1b690` : `#D8AA69` },
										};
									}),
							};
						})
						.filter((c) => c !== null) as TreeData[],
				};
			}),
		};
	}, [expRoots, expLeafs, expenseTotals]);

	const data2 = useMemo(() => {
		return {
			name: 'income',
			value: Object.keys(incomeTotals).reduce((acc, c) => acc + Math.abs(incomeTotals[c]), 0),
			itemStyle: { color: `#739d88` },
			children: incRoots.map((r) => {
				return {
					name: r,
					value: Object.keys(incomeTotals)
						.filter((c) => c.split('>')[0] === r)
						.reduce((acc, c) => acc + Math.abs(incomeTotals[c]), 0),
					itemStyle: { color: `#739d88` },
					children: incLeafs
						.map((l) => {
							if (l.includes('>') && l.split('>')[0] !== r) return null;
							const val = Math.abs(incomeTotals[`${r}>${l}`]) || 0;
							if (val === 0) return null;
							return {
								name: l,
								value: val,
								itemStyle: { color: `#739d88` },
								children: transactions
									.filter((t) => t.category === (!l.includes('>') ? `${r}>${l}` : l))
									.map((t) => {
										return {
											name: t.store,
											value: Math.abs(t.amount / 100),
											itemStyle: { color: `#739d88` },
										};
									}),
							};
						})
						.filter((c) => c !== null) as TreeData[],
				};
			}),
		};
	}, [incRoots, incLeafs, incomeTotals]);

	const option = useMemo(() => {
		return {
			tooltip: {
				trigger: 'item',
				triggerOn: 'mousemove',
			},
			legend: {
				top: 5,
				right: full ? 450 : 3,
				orient: 'vertical',
				data: [
					{
						name: 'expense',
						icon: 'rectangle',
						itemStyle: { color: full ? `#d1b690` : `#D8AA69` },
					},
					{
						name: 'income',
						icon: 'rectangle',
						itemStyle: { color: full ? `#99deb5` : `#739d88` },
					},
				],
				borderColor: '#c23531',
			},
			title: titleOptions('Allocation by Store', full),
			series: [
				{
					type: 'tree',
					name: 'expense',
					data: [data],

					top: 35,
					left: '8%',
					bottom: 0,
					right: '65%',

					symbolSize: 7,

					label: {
						position: 'top',
						verticalAlign: 'middle',
						align: 'right',
						color: full ? '#edd9be' : '#333',
						fontSize: full ? 16 : 12,
						textBorderColor: full ? '#000' : '#fff',
						textBorderType: 'solid',
						textBorderWidth: full ? 0 : 1,
					},

					leaves: {
						label: {
							position: 'right',
							verticalAlign: 'middle',
							align: 'left',
						},
					},

					emphasis: {
						focus: 'descendant',
					},

					expandAndCollapse: true,

					animationDuration: 550,
					animationDurationUpdate: 750,
				},
				{
					type: 'tree',
					name: 'income',
					data: [data2],

					top: 42,
					left: '59%',
					bottom: -5,
					right: '17%',

					symbolSize: 7,

					label: {
						position: 'top',
						verticalAlign: 'middle',
						align: 'right',
						color: full ? '#99deb5' : '#333',
						fontSize: full ? 16 : 12,
						textBorderColor: full ? '#000' : '#fff',
						textBorderType: 'solid',
						textBorderWidth: full ? 0 : 1,
					},

					leaves: {
						label: {
							position: 'right',
							verticalAlign: 'middle',
							align: 'left',
						},
					},

					expandAndCollapse: true,

					emphasis: {
						focus: 'descendant',
					},

					animationDuration: 550,
					animationDurationUpdate: 750,
				},
			],
		};
	}, [data, data2, full]);


	return (
		<ZoomChart full={full} toggleFull={toggleFull} option={option} />
	);
}
