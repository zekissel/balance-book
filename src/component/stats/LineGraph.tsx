import ReactECharts from "echarts-for-react";
import { Income, Expense, isExpense } from "../../typedef";
import '../../styles/Graph.css'
import { useMemo } from "react";

interface GraphProps { transactions: (Income | Expense)[], range: number, endDate: Date | null}
export default function TotalGraph ({ transactions, range, endDate }: GraphProps) {
  interface SeriesDay { date: Date, total: number }

  const timeFrameTotals = useMemo(() => {
    console.log(range)
    let totals: SeriesDay[] = Array.from({ length: range }, (_, i) => { return { date: new Date((endDate ?? new Date()).getTime() - (i * 24 * 60 * 60 * 1000)), total: 0 } });
    transactions.forEach(t => {
      const index = Math.floor(((endDate ?? new Date()).getTime() - t.date.getTime()) / (24 * 60 * 60 * 1000));
      if (range === 0 || index < range) {
        totals[index].total += (isExpense(t) ? -1 : 1) * (t.amount / 100);
      }
    })
    return totals.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions]);

  const xAxisInterval = useMemo(() => {
    if (range <= 10) return 0;
    else if (range <= 30) return 1;
    else if (range <= 60) return 3;
    else if (range <= 90) return 8;
    else if (range <= 180) return 18;
    else if (range <= 365) return 30;
    else if (range <= 730) return 60;
    else return 120;
  }, [range]);

  const option = {
    color: ['#739d88'],
    grid: { show: true },
    xAxis: {
      type: 'category',
      interval: 0,
      data: timeFrameTotals.map((t) => new Object({ value: t.date.toDateString().slice(4), label: {show: true} })),
      axisLabel: {
        rotate: 28,
        interval: xAxisInterval,
      },
      splitLine: { show: true, lineStyle: { color: '#ffffff', }},
    },
    yAxis: {
      type: 'value',
      splitLine: { show: true, lineStyle: { color: '#ffffff', }},
    },
    series: [
      {
        data: timeFrameTotals.map(t => new Object({value: t.total, label: {normal:{show:t.total !== 0,position:t.total > 0 ?'top':'bottom',formatter: '${c}'}} })),
        type: 'line',
      }
    ],
    title: {
      text: 'Net Balance by Day'
    },
    width: '87%',
    height: '64%',
    dataZoom: { type: 'inside' },
  };

  return (
    <div className='stats-graph'>
      <ReactECharts option={option} />
    </div>
  )
}