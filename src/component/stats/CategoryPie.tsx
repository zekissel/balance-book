import { Transaction } from '../../typedef';
import { useMemo } from 'react';
import { generateChartColor } from './graph';
import ZoomChart from './ZoomChart';

interface GraphProps {
	logs: Transaction[];
	typeIncome: boolean;
	full: boolean;
	toggleFull: () => void;
}
export default function CategoryPie({ logs, typeIncome, full, toggleFull }: GraphProps) {

  const categoryTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		logs
			.filter((t) => !['Transfer', 'Credit'].includes(t.category.split('>')[1]))
			.forEach((t) => {
				if ((typeIncome ? 1 : -1) * t.amount > 0 && totals[t.category] === undefined)
					totals[t.category] = 0;
				if ((typeIncome ? 1 : -1) * t.amount > 0) totals[t.category] += Math.abs(t.amount / 100);
			});
		if (Object.keys(totals).length === 0) return { 'No Data': 0 };
		return totals;
	}, [logs, typeIncome]);

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
						totals[0] !== 0 ? generateChartColor(colorMap[`${c.split('>')[0]}`], typeIncome) : '#abc',
				},
			}));

		if (ret[0].value === 0) return [{ name: 'No Data', value: 0, itemStyle: { color: '#abc' } }];
		else return ret;
	}, [categoryTotals, typeIncome, colorMap]);

	//const totalBalance = useMemo(() => { return totals.reduce((acc, t) => acc + t, 0); }, [totals]);

	const option = {
		legend: {
			type: 'scroll',
			orient: 'vertical',
			left: 'right',
			data: cat,
			y: 10,
			textStyle: {
				color: full ? '#fff' : '#333',
				fontSize: full ? 16 : 11,
			},
		},
		series: [
			{
				type: 'pie',
				data: data,
				y: 40,
				x: -60,
				label: {
					color: full ? '#fff' : '#333',
					fontSize: full ? 16 : 11,
					textBorderColor: full ? '#000' : '#fff',
					textBorderType: 'solid',
					textBorderWidth: 1,
				},
			},
		],
		title: {
			text: `${typeIncome ? 'Income' : 'Expense'} Percentage by Category`,
			left: full ? 'center' : 'left',
			top: full ? 15 : 0,
			textStyle: {
				color: full ? '#fff' : '#494949',
				fontSize: full ? 24 : 18,
			},
		},
		tooltip: {
			trigger: 'item',
			formatter: '{b}: <b>{d}%</b> (<em>${c}</em>)',
		},
	};

  return (
    <ZoomChart full={full} toggleFull={toggleFull} option={option} />
  );
}