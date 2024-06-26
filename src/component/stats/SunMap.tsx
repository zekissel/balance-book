import { Transaction } from '../../typedef';
import { useMemo } from 'react';
import ZoomChart from './ZoomChart';
import { titleOptions, generateChartColor } from './graph';

interface GraphProps {
	trans: Transaction[];
	treemap: boolean;
	income: boolean;
  full: boolean;
  toggleFull: () => void;
}
export default function SunMap({ trans, treemap, income, full, toggleFull }: GraphProps) {

	const transactions = useMemo(() => {
		return trans.filter(
			(t) => t.category.includes('>') && !['Transfer', 'Credit'].includes(t.category.split('>')[1]),
		);
	}, [trans]);

	const trunkTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		transactions.forEach((t) => {
			if (totals[t.category.split('>')[0]] === undefined) totals[t.category.split('>')[0]] = 0;
			totals[t.category.split('>')[0]] += Math.round(((income ? 1 : -1) * t.amount) / 100);
		});
		return totals;
	}, [transactions, income]);

	const categoryTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		transactions.forEach((t) => {
			if (totals[t.category] === undefined) totals[t.category] = 0;
			totals[t.category] += Math.round(((income ? 1 : -1) * t.amount) / 100);
		});
		totals;
		return totals;
	}, [transactions, income]);

	type MapData = { name: string; children: MapData[]; value: number; itemStyle: { color: string } };
	const data = useMemo(() => {
		const trunks = Object.keys(trunkTotals); //.sort((a, b) => trunkTotals[b] - trunkTotals[a]);

		const ret = trunks.map(
			(c, i) =>
				new Object({
					name: c,
					value: trunkTotals[c],
					children: [],
					itemStyle: { color: generateChartColor(i, income) },
				}) as MapData,
		);

		Object.keys(categoryTotals).forEach((t) => {
			const index = ret.findIndex((r) => r.name === t.split('>')[0]);
			if (index !== -1) {
				ret[index].children!.push(
					new Object({
						name: t.split('>')[1] === 'Other' ? t : t.split('>')[1],
						value: categoryTotals[t],
						itemStyle: { color: ret[index].itemStyle.color },
					}) as MapData,
				);
			}
		});

		if (ret.length < 1)
			return [{ name: 'No Data', value: 0.01, children: undefined, itemStyle: { color: '#abc' } }];
		return ret; //.sort((a, b) => b.value - a.value);
	}, [categoryTotals, trunkTotals]);

	const treemapOption = {
		title: titleOptions(`${income ? 'Income' : 'Expense'} Total by Category`, full),
		series: [
			{
				type: 'treemap',
				top: full ? 100 : 35,
				animationDurationUpdate: 1000,
				roam: false,
				nodeClick: 'zoomToNode',
				data: data,
				universalTransition: true,
				label: {
					show: true,
					color: '#222',
					fontSize: full ? 16 : 12,
					formatter: '{b}: ${c}',
				},
				breadcrumb: {
					show: false,
				},
			},
		],
		tooltip: {
			trigger: 'item',
			formatter: '{b}: <b>${c}</b>',
		},
	};
	const sunburstOption = {
		title: titleOptions(`${(income ? 'Income' : 'Expense')} Total by Category`, full),
		series: [
			{
				type: 'sunburst',
				radius: ['15%', '82%'],
				center: ['50%', full ? '50%' : '56%'],
				animationDurationUpdate: 1000,
				nodeClick: 'rootToNode',
				data: data,
				universalTransition: true,
				itemStyle: {
					borderWidth: 1,
					borderColor: 'rgba(255,255,255,.5)',
				},
				label: {
					show: true,
					fontSize: full ? 16 : 12,
					rotate: 0,
					formatter: '{b}',
				},
			},
		],
		tooltip: {
			trigger: 'item',
			formatter: '{b}: <b>${c}</b>',
		},
	};

	const option = useMemo(() => {
		return treemap ? treemapOption : sunburstOption;
	}, [treemap, income, trans, full]);

	return (
		<ZoomChart full={full} toggleFull={toggleFull} option={option} />
	);
}
