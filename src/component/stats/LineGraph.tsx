import ReactECharts from "echarts-for-react";
import { Transaction } from "../../typedef";
import { useMemo } from "react";
import { addDays } from "../../typeassist";

interface GraphProps { transactions: Transaction[], range: number, endDate: Date}
export default function TotalGraph ({ transactions, range, endDate }: GraphProps) {
  interface SeriesDay { date: Date, total: number }

  const timeFrameTotals = useMemo(() => {
    const today = new Date(endDate.toDateString());
    let totals: SeriesDay[] = Array.from({ length: range+1 }, (_, i) => { return { date: addDays(today, -i), total: 0 } });
    transactions.forEach(t => {
      const index = Math.ceil((endDate.getTime() - t.date.getTime()) / (24 * 60 * 60 * 1000));
      if (index <= range) {
        totals[index].total += Math.round(t.amount / 100);
      }
    })
    
    return totals.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions, range, endDate]);


  const xAxisInterval = useMemo(() => {
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
    color: ['#739d88'],
    grid: { show: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      formatter: '<b>{b}</b><br/>${c}'
    },
    xAxis: {
      type: 'category',
      interval: 0,
      data: timeFrameTotals.map((t) => new Object({ value: t.date.toDateString().slice(4, range >= 100 ? 15 : 10), label: {show: true} })),
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
        data: timeFrameTotals.map(t => new Object({value: t.total, label: {show:t.total !== 0,position:t.total > 0 ?'top':'bottom',formatter: '${c}'} })),
        type: 'line',
      }
    ],
    title: {
      text: 'Net Balance by Day'
    },
    width: '87%',
    height: range >= 100 ? '64%' : '70%',
    dataZoom: { type: 'inside' },
  };

  return (
    <div className='stats-graph'>
      <ReactECharts option={option} />
    </div>
  )
}