import { Transaction } from '../../typedef';
import { useMemo } from 'react';
import ZoomChart from './ZoomChart';
import { titleOptions, xAxisOptions, yAxisOptions } from './graph';

interface GraphProps {
  logs: Transaction[];
	full: boolean;
	toggleFull: () => void;
}
export default function CategoryBar({ logs, full, toggleFull }: GraphProps) {

  const categoryTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		logs
			.filter((t) => !['Transfer', 'Credit'].includes(t.category.split('>')[1]))
			.forEach((t) => {
				if (totals[t.category] === undefined) totals[t.category] = 0;
				totals[t.category] += Math.round(t.amount / 100);
			});
		return totals;
	}, [logs]);

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
							itemStyle: { color: t > 0 ? '#739d88' : '#D8AA69' },
							label: { 
								show: true, 
								position: t >= 0 ? 'top' : 'bottom', 
								formatter: '${c}',
								color: full ? `#fff` : `#333`,
								textBorderColor: full ? '#000' : '#fff',
								textBorderType: 'solid',
								textBorderWidth: 1,
                fontSize: full ? 16 : 12,
							},
							
						}),
				),
		[categoryTotals, full],
	);

  const option = {
		xAxis: xAxisOptions(categories, full, full, false, 0, 20),
		yAxis: yAxisOptions(full),
		series: [
			{
				data: totals,
				type: 'bar',
				itemStyle: { color: '#739d88' },
			},
		],
		title: titleOptions('Total Balance by Category', full),
		width: full ? '85%' : 
			(Math.max(...Object.values(categoryTotals).map((v) => Math.abs(v))) >= 10000 ? '87%' : '90%'),
		height: full ? '72%' : '77%',
		grid: {
			top: full ? 120 : 45,
			// maximize graph space: 12px per digit + 10px padding
			left: full ? 130 :
				(logs.length === 0
					? 35
					: Math.round(
							Math.max(...Object.values(categoryTotals).map((v) => Math.abs(v))),
						).toString().length *
							12 +
						10),
		},
		dataZoom: { type: 'inside' },
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'shadow' },
			formatter: '{b}: <b>${c}</b>',
		},
	};


  return (
    <ZoomChart full={full} toggleFull={toggleFull} option={option} />
  )
}