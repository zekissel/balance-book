import ReactECharts from 'echarts-for-react';
import { Transaction } from '../../typedef';
import { useMemo } from 'react';
import { addDays } from '../../typeassist';
import * as echarts from 'echarts';

interface GraphProps { transactions: Transaction[], startDate: Date, endDate: Date }
export default function HeatMap ({ transactions, startDate, endDate }: GraphProps) {
  interface SeriesDay { date: Date, total: number }

  const rangeStart = useMemo(() => {
    let string = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-01`;
    if (string.split('-')[1].length === 1) { string = string.slice(0, 5) + '0' + string.slice(5); }
    return addDays(new Date(string), 1);
  }, [startDate]);
  const rangeEnd = useMemo(() => {
    let string = `${endDate.getFullYear()}-${endDate.getMonth() + 2}-01`;
    if (string.split('-')[1].length === 1) { string = string.slice(0, 5) + '0' + string.slice(5); }
    return addDays(new Date(string), 0);
  }, [endDate]);
  
  const timeFrameTotals = useMemo(() => {
    const totals: SeriesDay[] = [];
    let tempDate = new Date(rangeStart.toDateString());
    while (tempDate.getTime() <= rangeEnd.getTime()) {
      totals.push({ date: tempDate, total: tempDate.getTime() < startDate.getTime() ? NaN : 0 });
      tempDate = addDays(tempDate, 1);
    }
    transactions.forEach(t => {
      const index = totals.findIndex(d => d.date.toDateString() === t.date.toDateString());
      if (index !== -1) {
        totals[index].total = totals[index].total ? totals[index].total + t.amount : t.amount;
      }
    });
    return totals;
  }, [transactions, rangeStart, rangeEnd]);

  const max = Math.round((timeFrameTotals.reduce((max, t) => t.total > max ? t.total : max, 0) * 1.05) / 100);
  const min = Math.round((timeFrameTotals.reduce((min, t) => t.total < min ? t.total : min, 0) * 1.05) / 100);
  
  const option = {
    title: {
      text: 'Transaction Heat Map',
    },
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `${params.value[0].split('-').slice(1).join('-')}: <b>$${params.value[1]}</b>`;
      }
    },
    visualMap: {
      min: min,
      max: max,
      inRange : { color: ['#DCF17D', '#83CDA2' ] },
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      top: 65
    },
    calendar: {
      top: 120,
      left: 30,
      right: 30,
      cellSize: ['auto', 20],
      range: [`${rangeStart.toISOString().split('T')[0]}`, `${rangeEnd.toISOString().split('T')[0]}`],
      itemStyle: {
        borderWidth: 0.5
      },
      yearLabel: { show: false }
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: timeFrameTotals.map(t => [echarts.time.format(t.date, '{yyyy}-{MM}-{dd}', false), t.total / 100])
    }
  };

  return (
    <div className='stats-graph'>
      <ReactECharts option={option} />
    </div>
  )
}