import ReactECharts from 'echarts-for-react';
import { Transaction } from '../../typedef';
import { useMemo } from 'react';
import { generateChartColor } from '../../typeassist';

interface GraphProps {
	transactions: Transaction[];
	isIncome: boolean;
}
export default function PieGraph({ transactions, isIncome }: GraphProps) {
	const categoryTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		transactions
			.filter((t) => !['Transfer', 'Credit'].includes(t.category.split('>')[1]))
			.forEach((t) => {
				if ((isIncome ? 1 : -1) * t.amount > 0 && totals[t.category] === undefined)
					totals[t.category] = 0;
				if ((isIncome ? 1 : -1) * t.amount > 0) totals[t.category] += Math.abs(t.amount / 100);
			});
		if (Object.keys(totals).length === 0) return { 'No Data': 0 };
		return totals;
	}, [transactions, isIncome]);

	const categories = useMemo(
		() => Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]),
		[categoryTotals],
	);
	const totals = useMemo(
		() => Object.values(categoryTotals).sort((a, b) => b - a),
		[categoryTotals],
	);
	const cat = useMemo(() => {
		const ret = categories
			.filter((c) => c.includes('>'))
			.map((cat) => (cat.split('>')[1] === 'Other' ? cat : cat.split('>')[1]));
		if (ret.length === 0) return ['No Data'];
		else return ret;
	}, [categories]);

	const colorMap = useMemo(() => {
		const map: { [key: string]: number } = {};
		let index = 0;
		categories
			.map((c) => c.split('>')[0])
			.forEach((c) => (map[c] === undefined ? (map[c] = index++) : null));

		return map;
	}, [categories]);

	const data = useMemo(() => {
		const ret = Object.keys(categoryTotals)
			.sort((a, b) => categoryTotals[b] - categoryTotals[a])
			.map((c) => ({
				name: c.split('>')[1] === 'Other' ? c : c.split('>')[1],
				value: categoryTotals[c],
				itemStyle: {
					color:
						totals[0] !== 0 ? generateChartColor(colorMap[`${c.split('>')[0]}`], isIncome) : '#abc',
				},
			}));

		if (ret[0].value === 0) return [{ name: 'No Data', value: 0, itemStyle: { color: '#abc' } }];
		else return ret;
	}, [categoryTotals, isIncome, colorMap]);

	//const totalBalance = useMemo(() => { return totals.reduce((acc, t) => acc + t, 0); }, [totals]);

	const option = {
		legend: {
			type: 'scroll',
			orient: 'vertical',
			left: 'right',
			data: cat,
			y: 10,
		},
		series: [
			{
				type: 'pie',
				data: data,
				y: 40,
				x: -60,
			},
		],
		title: {
			text: `${isIncome ? 'Income' : 'Expense'} Percentage by Category`,
			y: 10,
		},
		tooltip: {
			trigger: 'item',
			formatter: '{b}: <b>{d}%</b> (<em>${c}</em>)',
		},
	};

	return (
		<div className="stats-graph">
			<ReactECharts option={option} />
		</div>
	);
}
