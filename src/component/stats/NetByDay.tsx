import ReactECharts from 'echarts-for-react';
import { Transaction } from '../../typedef';
import { useMemo, useState } from 'react';
import { addDays } from '../../typeassist';
import ZoomChart from './ZoomChart';
import { titleOptions } from './common_chart';

interface GraphProps {
	transactions: Transaction[];
	range: number;
	endDate: Date;
  typeLine: boolean;
}
export default function NetByDay({ transactions, range, endDate, typeLine }: GraphProps) {

  const [full, setFull] = useState(false);
	const toggleFull = () => setFull(!full);
	
  type SeriesDay = { date: Date; total: number; }
	const timeFrameTotals = useMemo(() => {
		const today = new Date(endDate.toDateString());
		const totals: SeriesDay[] = Array.from({ length: range + 1 }, (_, i) => {
			return { date: addDays(today, -i), total: 0 };
		});
		transactions.forEach((t) => {
			const index = Math.ceil((endDate.getTime() - t.date.getTime()) / (24 * 60 * 60 * 1000));
			if (index <= range) {
				totals[index].total += Math.round(t.amount / 100);
			}
		});

		return totals.sort((a, b) => a.date.getTime() - b.date.getTime());
	}, [transactions, range, endDate]);

	const xAxisInterval: number = useMemo(() => {
		if (range <= 14) return 0;
		else if (range <= 30) return 1;
		else if (range <= 60) return 3;
		else if (range <= 90) return 8;
		else if (range <= 180) return 18;
		else if (range <= 365) return 30;
		else if (range <= 730) return 50;
		else return 80;
	}, [range]);

	const option = {
		color: [
			transactions.filter((t) => !['Transfer', 'Credit'].includes(t.category.split('>')[1]))
				.length === 0
				? '#abc'
				: (full? '#99deb5' :'#739d88'),
		],
		title: titleOptions('Net Balance by Day', full),
		width:
			full ? '75%' : (Math.max(...Object.values(timeFrameTotals).map((v) => Math.abs(v.total))) >= 10000
				? '87%'
				: '90%'),
		height: full ? '70%' : (range >= 100 ? '73%' : '78%'),
		grid: {
			show: true,
			top: full ? '15%' :'13%',
			left:
				full ? '15%' : (transactions.length === 0
					? 35
					: Math.round(
							Math.max(...Object.values(timeFrameTotals).map((v) => Math.abs(v.total))),
						).toString().length *
							12 +
						10),
		},
		xAxis: {
      axisLine: { lineStyle: { color: full ? '#ffffff77' : '#ffffff' } },
			type: 'category',
			interval: 0,
			data: timeFrameTotals.map(
				(t) =>
					new Object({
						value: t.date.toDateString().slice(4, range >= 100 ? 15 : 10),
						label: { show: true },
					}),
			),
			axisLabel: {
				rotate: 20,
				interval: xAxisInterval,
        color: full ? `#fff` : `#333`,
        fontSize: full ? 16 : 12,
			},
			splitLine: { show: true, lineStyle: { color: full ? '#ffffff77' : '#ffffff' } },
		},
		yAxis: {
			type: 'value',
			splitLine: { show: true, lineStyle: { color: full ? '#ffffff77' : '#ffffff' } },
      axisLabel: {
        color: full ? `#fff` : `#333`,
        fontSize: full ? 16 : 12,
      },
		},
		series: [
			{
				data: timeFrameTotals.map(
					(t) =>
						new Object({
							value: t.total,
              itemStyle: {
                color: typeLine ? (full? '#99deb5' : '#739d88') : (transactions.length > 0 ? (t.total > 0 ? (full? '#99deb5' :'#739d88') : (full? '#f6d6aa' :'#D8AA69')) : '#abc'),
              },
							label: {
								show: /*range >= 24 ? (i % 2 == 0 && t.total !== 0) :*/ (t.total !== 0),
								position: t.total > 0 ? 'top' : 'bottom',
								formatter: '${c}',
                color: full ? `#fff` : `#333`,
								textBorderColor: full ? '#000' : '#fff',
								textBorderType: 'solid',
								textBorderWidth: 1,
                fontSize: full ? 16 : 12,
							},
						}),
				),
				type: typeLine ? 'line' : 'bar',
			},
		],
		dataZoom: { type: 'inside' },
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'line' },
			formatter: '<b>{b}</b><br/>${c}',
		},
	};

	return (
		<ZoomChart full={full} toggleFull={toggleFull}>
			<ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
		</ZoomChart>
	);
}
