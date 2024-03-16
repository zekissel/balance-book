import ReactECharts from "echarts-for-react";
import { Income, Expense, isExpense } from "../../typedef";
import '../../styles/Graph.css'
import { useMemo } from "react";

interface GraphProps { transactions: (Income | Expense)[], range: number }
export default function TotalGraph ({ transactions, range }: GraphProps) {
  interface SeriesDay { date: Date, total: number }

  const timeFrameTotals = useMemo(() => {
    let totals: SeriesDay[] = Array.from({ length: range }, (_, i) => { return { date: new Date(new Date().getTime() - (i * 24 * 60 * 60 * 1000)), total: 0 } });
    transactions.forEach(t => {
      const index = Math.floor((new Date().getTime() - t.date.getTime()) / (24 * 60 * 60 * 1000));
      if (index < range) {
        totals[index].total += (isExpense(t) ? -1 : 1) * (t.amount / 100);
      }
    })
    return totals.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions]);

  const xAxisInterval = useMemo(() => {
    switch (range) {
      case 14: return 0;
      case 30: return 2;
      case 90: return 10;
      case 182: return 18;
      case 365: return 30;
    }
  }, [range]);

  const option = {
    color: ['#739d88'],
    grid: { show: true },
    xAxis: {
      type: 'category',
      interval: 2,
      data: timeFrameTotals.map((t) => new Object({ value: t.date.toDateString().slice(4), label: {normal: {show: true}} })),
      axisLabel: {
        rotate: 35,
        interval: xAxisInterval,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: timeFrameTotals.map(t => new Object({value: t.total, label: {normal:{show:t.total !== 0,position:t.total > 0 ?'top':'bottom',formatter: '${c}'}} })),
        type: 'line',
      }
    ],
    title: {
      text: 'Net Transactions by Day'
    },
    //dataZoom: {  },
  };

  return (
    <div className='stats-graph'>
      <ReactECharts option={option} />
    </div>
  )
}