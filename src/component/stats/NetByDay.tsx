import ReactECharts from 'echarts-for-react';
import { Transaction } from '../../typedef';
import { useMemo, useState } from 'react';
import { addDays } from '../../typeassist';
import ZoomChart from './ZoomChart';
import { titleOptions, xAxisOptions, yAxisOptions } from './common_chart';

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

	const yAxisRange = useMemo(() => {
		const max = Math.max(...Object.values(timeFrameTotals).map((v) => v.total));
		const min = Math.min(...Object.values(timeFrameTotals).map((v) => v.total));
		const range = Math.ceil((max - min) / 1000) * 1000;
		return range > 0 ? range : 1000;
	}, [timeFrameTotals]);

	const xAxisInterval: number = useMemo(() => {
		if (range <= 14) return 0;
		else if (range <= 30) return 1;
		else if (range <= 60) return 3;
		else if (range <= 90) return 8;
		else if (range <= 180) return 18;
		else if (range <= 365) return 30;
		else if (range <= 730) return 50;
		else return Math.round(range / 15);
	}, [range]);


	const option = useMemo(() => {
		return new Object({
			/*color: [
				transactions.filter((t) => !['Transfer', 'Credit'].includes(t.category.split('>')[1]))
					.length === 0
					? '#abc'
					: (full? '#99deb5' :'#739d88'),
			],*/
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
			xAxis: xAxisOptions(timeFrameTotals.map(
				(t) =>
					new Object({
						value: t.date.toDateString().slice(4, range >= 100 ? 15 : 10),
						label: { show: true },
					}),
			), full, true, true, xAxisInterval, 20),
			yAxis: yAxisOptions(full),
			series: [
				{
					data: timeFrameTotals.map(
						(t) =>
							new Object({
								value: t.total,
								itemStyle: {
									color: t.total !== 0 ? (transactions.length > 0 ? (t.total > 0 ? (full? '#99deb5' :'#739d88') : (full? '#f6d6aa' :'#D8AA69')) : '#5d82a8') : (full ? '#81b2e6' : '#5d82a8'),
								},
								label: {
									show: t.total !== 0,
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
			visualMap: {
				type: 'piecewise',
				show: false,
				dimension: 1,
				pieces: [
					{
						lt: -(yAxisRange / 600),
						color: '#D8AA69',
					},
					{
					gte: -(yAxisRange / 600),
					lte: (yAxisRange / 600),
					color: full ? '#81b2e6' : '#5d82a8',
				},
					{
						gt: yAxisRange / 600,
						color: '#739d88',
					},
				],
			},
		});
	}, [timeFrameTotals, full, transactions, range, typeLine, yAxisRange])

	return (
		<ZoomChart full={full} toggleFull={toggleFull}>
			<ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
		</ZoomChart>
	);
}
