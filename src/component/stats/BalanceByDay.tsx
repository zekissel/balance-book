import { Transaction } from '../../typedef';
import { useMemo } from 'react';
import { addDays } from '../../typeassist';
import ChartBase from './ChartBase';

interface GraphProps {
	transactions: Transaction[];
	range: number;
	endDate: Date;
  typeLine: boolean;
}
export default function BalanceByDay({ transactions, range, endDate, typeLine }: GraphProps) {

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
      transactions.length > 0 ? (typeLine ? 1 : -1) : 0,
		],
		grid: {
			show: true,
			left:
				(transactions.length === 0
					? 35
					: Math.round(
							Math.max(...Object.values(timeFrameTotals).map((v) => Math.abs(v.total))),
						).toString().length *
							12 +
						10),
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'line' },
			formatter: '<b>{b}</b><br/>${c}',
		},
		xAxis: {
			type: 'category',
			interval: xAxisInterval,
			data: timeFrameTotals.map(
				(t) =>
					new Object({
						value: t.date.toDateString().slice(4, range >= 100 ? 15 : 10),
						label: { show: t.total !== 0 },
					}) as { value: string; label: { show: boolean; } },
			),
			splitLine: { show: true, },
		},
		yAxis: {
			type: 'value',
			splitLine: { show: true, },
		},
		series: [
			{
				data: timeFrameTotals.map(
					(t) =>
						new Object({
							value: t.total,
              itemStyle: {
                color: transactions.length > 0 ? ((t.total > 0 || typeLine) ? 1 : -1) : 0,
              },
							label: {
								show: t.total !== 0,
								position: t.total > 0 ? 'top' : 'bottom',
								formatter: '${c}',
							},
						}) as { value: number; itemStyle: { color: number; }; label: { show: boolean; position: string; formatter: string; }; },
				),
				type: typeLine ? 'line' : 'bar',
			},
		],
		title: {
			text: 'Net Balance by Day',
		},
		width:{ decrPercent: Math.max(...Object.values(timeFrameTotals).map((v) => Math.abs(v.total))).toString().length },
		height: { small: range >= 100},
	};

  
	return (
		<ChartBase modify={option} />
	);
}
