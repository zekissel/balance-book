import ReactECharts from 'echarts-for-react';
import { Transaction } from '../../typedef';
import { useMemo, useState } from 'react';
import ZoomChart from './ZoomChart';
import { titleOptions } from './common_chart';

interface GraphProps {
	trans: Transaction[];
	isIncome: boolean;
	root: string | null;
}
export default function BoxPlot({ trans, isIncome, root }: GraphProps) {

	const [full, setFull] = useState(false);
	const toggleFull = () => setFull(!full);

	const transactions = useMemo(() => {
		return (
			isIncome ? trans.filter((t) => t.amount > 0) : trans.filter((t) => t.amount < 0)
		).filter((t) => !['Transfer', 'Credit'].includes(t.category.split('>')[1]));
	}, [trans, isIncome]);

	const categoryTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		if (root) {
			transactions
				.filter((t) => t.category.includes('>') && t.category.split('>')[0] === root)
				.forEach((t) => {
					if (totals[t.category.split('>')[1]] === undefined) totals[t.category.split('>')[1]] = 0;
					totals[t.category.split('>')[1]] += Math.round(t.amount / 100);
				});
		} else {
			transactions
				.filter((t) => t.category.includes('>'))
				.forEach((t) => {
					if (totals[t.category.split('>')[0]] === undefined) totals[t.category.split('>')[0]] = 0;
					totals[t.category.split('>')[0]] += Math.round(t.amount / 100);
				});
		}
		return totals;
	}, [transactions, root]);

	const categories = useMemo(() => {
		return Object.keys(categoryTotals);
	}, [categoryTotals]);

	const [outliers, setOutliers] = useState<number[][]>([]);

	const source = useMemo(() => {
		setOutliers([]);
		const out: number[][] = [];
		const ret = Array.from({ length: categories.length }, (_, i) => {
			const relevant: number[] = (
				root
					? transactions.filter(
							(t) =>
								t.category.split('>')[0] === root && t.category.split('>')[1] === categories[i],
						)
					: transactions.filter((t) => t.category.split('>')[0] === categories[i])
			)
				.map((t) => Math.abs(t.amount / 100))
				.sort((a, b) => a - b);
			//const relevant = transactions.filter((t) => t.category.split('>')[0] === categories[i]).map(t => Math.abs(t.amount / 100)).sort((a, b) => a - b);

			const q1 = relevant[Math.floor((relevant.length - 1) * 0.25)];
			const median = relevant[Math.floor(relevant.length / 2)];
			const q3 = relevant[Math.ceil((relevant.length - 1) * 0.75)];

			const iqr = q3 - q1;
			const low = Math.max(q1 - 1.5 * iqr, 0);
			const high = q3 + 1.5 * iqr;
			//const min = Math.min(...relevant);
			//const max = Math.max(...relevant);

			const outside = relevant
				.filter((r) => r < low || r > high)
				.map((r) => [r, categories.findIndex((c) => c === categories[i])]);

			for (const coord of outside) {
				if (!out.some((o) => o[0] === coord[0] && o[1] === coord[1])) out.push(coord);
			}

			return [low, q1, median, q3, high];
		});
		setOutliers(out);
		return ret;
	}, [transactions, categories, root]);

	const option = {
		title: titleOptions(`${isIncome ? 'Income' : 'Expense'} Spread by Category`, full),
		height: full ? '70%' : '83%',
		grid: {
			left: '14%',
			right: '11%',
			bottom: '6%',
			top: '11%',
		},
		yAxis: {
			type: 'category',
			data: Object.keys(categoryTotals).map((c) => new Object({ value: c.slice(0, 9) })),
			splitLine: { show: false, },
			axisLabel: {
        color: full ? `#fff` : `#333`,
        fontSize: full ? 16 : 12,
			},
		},
		xAxis: {
			type: 'value',
			name: 'Dollars',
			nameTextStyle: {
				color: full ? `#fff` : `#333`,
				fontSize: full ? 16 : 12,
			},
			nameLocation: 'end',
			splitArea: {
				show: true,
			},
			axisLabel: {
        color: full ? `#fff` : `#333`,
        fontSize: full ? 16 : 12,
			},
			splitLine: { show: full, lineStyle: { color: '#ffffff44' } },
		},
		series: [
			{
				name: 'IQR Spread',
				type: 'boxplot',
				data: source,
				itemStyle: {
					color: full ? (isIncome ? '#99deb577' : '#f6d6aa77') :(isIncome ? '#739d8877' : '#D8AA6977'),
					borderColor: full ? (isIncome ? '#a7e8c1' : '#e3cbaa') :(isIncome ? '#405c4e' : '#635645'),
				},
			},
			{
				name: 'Outlier',
				type: 'scatter',
				data: outliers,
				itemStyle: {
					color: full ? (isIncome ? '#a7e8c1' : '#e3cbaa') :(isIncome ? '#405c4e' : '#635645'),
				},
			},
		],
		dataZoom: {
			type: 'inside',
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			//formatter: '{b}: <br />Low: ${d[0]} <br />Q1: ${c[1]} <br />Median: ${c[2]} <br />Q3: ${c[3]} <br />High: ${c[4]}',
		},
	};


	return (
		<ZoomChart full={full} toggleFull={toggleFull}>
			<ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
		</ZoomChart>
	);
}
