import { useMemo } from 'react';
import ZoomChart from "./ZoomChart";
import { Transaction, addDays } from '../../typedef';
import { titleOptions, xAxisOptions, yAxisOptions } from './graph';


interface GraphProps {
	logs: Transaction[];
	range: number;
	endDate: Date;
  typeLine: boolean;
  full: boolean;
  toggleFull: () => void;
}
export default function NetByDay({ logs, range, endDate, typeLine, full, toggleFull }: GraphProps) {

  type SeriesDay = { date: Date; total: number; }
	const timeFrameTotals = useMemo(() => {
		const today = new Date(endDate.toDateString());
		const totals: SeriesDay[] = Array.from({ length: range + 1 }, (_, i) => {
			return { date: addDays(today, -i), total: 0 };
		});
		logs.forEach((t) => {
			const index = Math.ceil((endDate.getTime() - t.date.getTime()) / (24 * 60 * 60 * 1000));
			if (index <= range && index >= 0) {
				totals[index].total += Math.round(t.amount / 100);
			}
		});

		return totals.sort((a, b) => a.date.getTime() - b.date.getTime());
	}, [logs, range, endDate]);

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


	const option = {
    title: titleOptions(`Net Balance by Day`, full),
    width:
      full ? '75%' : (Math.max(...Object.values(timeFrameTotals).map((v) => Math.abs(v.total))) >= 10000
        ? '87%'
        : '90%'),
    height: full ? '70%' : (range >= 100 ? '73%' : '78%'),
    grid: {
      show: true,
      top: full ? '15%' :'13%',
      left:
        full ? '15%' : (logs.length === 0
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
                color: t.total !== 0 ? (logs.length > 0 ? (t.total > 0 ? (full? '#99deb5' :'#739d88') : (full? '#f6d6aa' :'#D8AA69')) : '#5d82a8') : (full ? '#81b2e6' : '#5d82a8'),
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
          color: full ? `#f6d6aa` : '#D8AA69',
        },
        {
        gte: -(yAxisRange / 600),
        lte: (yAxisRange / 600),
        color: full ? '#81b2e6' : '#5d82a8',
      },
        {
          gt: yAxisRange / 600,
          color: full ? `#99deb5` : '#739d88',
        },
      ],
    },
	};

  return (
    <ZoomChart full={full} toggleFull={toggleFull} option={option} />
  );
}