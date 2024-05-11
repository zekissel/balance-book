import { useState, useMemo } from "react";
import ZoomChart from "../stats/ZoomChart";
import { Account, Transaction, addDays, AccountType } from "../../typedef";
import { titleOptions } from "../stats/graph";


interface AccountGraphProps { 
  account: Account ,
  logs: Transaction[],

}
export default function AccountGraph({ account, logs }: AccountGraphProps) {

  const [full, setFull] = useState(false);
  const toggleFull = () => setFull(!full);

  const range = 30;

	interface SeriesDay {
		date: Date;
		total: number;
	}
	const timeFrameTotals = useMemo(() => {
		const today = new Date(new Date().toDateString());
		const totals: SeriesDay[] = Array.from({ length: range + 1 }, (_, i) => {
			return { date: addDays(today, -i), total: account.balance };
		});
		const minTime = addDays(today, -range).getTime();

		logs.forEach((trans) => {
			if (trans.date.getTime() >= minTime) {
				let index = totals.findIndex((t) => t.date.toDateString() === trans.date.toDateString());
				if (index !== -1) {
					while (index < range) {
						index += 1;
						totals[index].total +=
							(account.type !== AccountType.Credit ? -1 : 1) * trans.amount;
					}
				} else if (trans.date.getTime() > today.getTime()) {
					index = range;
					while (index > -1) {
						totals[index].total += (trans.account_id === account.id ? -1 : 1) * trans.amount;
						index -= 1;
					}
				}
			}
		});

		return totals.sort((a, b) => a.date.getTime() - b.date.getTime());
	}, [logs, range, account.balance]);

	const option = {
		color: ['#739d88'],
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'line' },
			formatter: '<b>{b}</b><br/>${c}',
		},
		grid: { show: true, top: 24, left: 60 },
		xAxis: {
			type: 'category',
			interval: 0,
			data: timeFrameTotals.map(
				(t) => new Object({ value: t.date.toDateString().slice(4, 10), label: { show: true } }),
			),
			axisLabel: {
				rotate: 28,
				interval: 2,
			},
			splitLine: { show: true, lineStyle: { color: '#ffffff' } },
		},
		yAxis: {
			type: 'value',
			splitLine: { show: true, lineStyle: { color: '#ffffff' } },
		},
		series: [
			{
				data: timeFrameTotals.map(
					(t, i) =>
						new Object({
							value: t.total / 100,
							label: {
								show: i % 5 == 0,
								position: i % 2 == 0 ? 'top' : 'bottom',
								formatter: '${c}',
								color: 'black',
							},
						}),
				),
				type: 'line',
				step: 'end',
        top: '1%',
			},
		],
		title: titleOptions('Account Balance by Day', full),
		width: '90%',
		height: '75%',
		dataZoom: { type: 'inside' },
	};

  return (
    <ZoomChart full={full} toggleFull={toggleFull} option={option} />
  )
}