import ReactECharts from 'echarts-for-react';
import { Transaction } from '../../typedef';
import { useMemo } from 'react';

interface GraphProps {
	transactions: Transaction[];
}
export default function TotalGraph({ transactions }: GraphProps) {
	const categoryTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		transactions.filter(t => !['Transfer', 'Credit'].includes(t.category.split('>')[1])).forEach((t) => {
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
	const totals = useMemo(
		() =>
			Object.values(categoryTotals)
				.sort((a, b) => a - b)
				.map(
					(t) =>
						new Object({
							value: t,
							itemStyle: { color: t > 0 ? '#739d88' : '#f6d6aa' },
							label: { show: true, position: t >= 0 ? 'top' : 'bottom', formatter: '${c}' },
						}),
				),
		[categoryTotals],
	);

	const option = {
		xAxis: {
			type: 'category',
			data: categories,
			axisLabel: {
				rotate: 28,
				show: false,
			},
		},
		yAxis: {
			type: 'value',
			splitLine: { show: true, lineStyle: { color: '#ffffff' } },
		},
		series: [
			{
				data: totals,
				type: 'bar',
				itemStyle: { color: '#739d88' },
			},
		],
		title: {
			text: 'Total Balance by Category',
		},
		width: '87%',
		height: '74%',
		grid: {
			top: 30,
		},
		dataZoom: { type: 'inside' },
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			formatter: '{b}: <b>${c}</b>',
		},
	};

	return (
		<div className="stats-graph">
			<ReactECharts option={option} />
		</div>
	);
}
