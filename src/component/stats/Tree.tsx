import ReactECharts from 'echarts-for-react';
import { Transaction } from '../../typedef';
import { useMemo } from 'react';

interface GraphProps {
	transactions: Transaction[];
}
export default function Tree({ transactions }: GraphProps) {

	const incomeTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		transactions.filter(t => t.amount > 0).forEach((t) => {
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
		const ret = Object.keys(incomeTotals).filter(c => c.includes('>')).map((c) => c.split('>')[1] !== 'Other' ? c.split('>')[1] : c);
		return [...new Set(ret)];
	}, [incomeTotals]);

	const expenseTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		transactions.filter(t => t.amount < 0).forEach((t) => {
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
		const ret = Object.keys(expenseTotals).filter(c => c.includes('>')).map((c) => c.split('>')[1] !== 'Other' ? c.split('>')[1] : c);
		return [...new Set(ret)];
	}, [expenseTotals]);


	const data = useMemo(() => {
		return {
			name: 'expense',
			itemStyle: { color: `#f6d6aa` },
			children: 
				expRoots.map((r) => {
					return {
						name: r,
						itemStyle: { color: `#f6d6aa` },
						children: expLeafs.map((l) => {
							if (l.includes('>') && l.split('>')[0] !== r)	return null;
							const val = Math.abs(expenseTotals[!l.includes('>') ? `${r}>${l}` : `${l}`]) || 0;
							if (val === 0) return null;
							return {
								name: l,
								value: val,
								itemStyle: { color: `#f6d6aa` },
								children: transactions.filter(t => (t.category === (!l.includes('>') ? (`${r}>${l}`) : l))).map(t => {
									return {
										name: t.company,
										value: Math.abs(t.amount / 100),
										itemStyle: { color: `#f6d6aa` },
									};
								
								})
							};
						}).filter((c) => c !== null) as any[],
					};
				}),
			
		}
	}, [expRoots, expLeafs, expenseTotals]);
	
	const data2 = useMemo(() => {
		return {
			name: 'income',
			itemStyle: { color: `#739d88` },
			children: 
				incRoots.map((r) => {
					return {
						name: r,
						itemStyle: { color: `#739d88` },
						children: incLeafs.map((l) => {
							if (l.includes('>') && l.split('>')[0] !== r)	return null;
							const val = Math.abs(incomeTotals[`${r}>${l}`]) || 0;
							if (val === 0) return null;
							return {
								name: l,
								value: val,
								itemStyle: { color: `#739d88` },
									children: transactions.filter(t => (t.category === (!l.includes('>') ? (`${r}>${l}`) : l))).map(t => {
										return {
											name: t.company,
											value: Math.abs(t.amount / 100),
											itemStyle: { color: `#739d88` },
										};
									})
							};
						}).filter((c) => c !== null) as any[],
					};
				}),
		}
	}, [incRoots, incLeafs, incomeTotals]);

	const option = useMemo(() =>{
		return {
			tooltip: {
				trigger: 'item',
				triggerOn: 'mousemove'
			},
			legend: {
				top: 5,
				right: 3,
				orient: 'vertical',
				data: [
					{
						name: 'expense',
						icon: 'rectangle',
						itemStyle: { color: `#f6d6aa` },
					},
					{
						name: 'income',
						icon: 'rectangle',
						itemStyle: { color: `#739d88` },
					}
				],
				borderColor: '#c23531'
			},
			title: {
				text: 'Allocation by Store',
				top: 5,
			},
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
						align: 'right'
					},

					leaves: {
						label: {
							position: 'right',
							verticalAlign: 'middle',
							align: 'left'
						}
					},

					emphasis: {
						focus: 'descendant'
					},

					expandAndCollapse: true,

					animationDuration: 550,
					animationDurationUpdate: 750
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
						align: 'right'
					},

					leaves: {
						label: {
							position: 'right',
							verticalAlign: 'middle',
							align: 'left'
						}
					},

					expandAndCollapse: true,

					emphasis: {
						focus: 'descendant'
					},

					animationDuration: 550,
					animationDurationUpdate: 750
				}
			]
		};
	}, [data, data2]);

	return (
		<div className="stats-graph">
			<ReactECharts option={option} />
		</div>
	);
}
