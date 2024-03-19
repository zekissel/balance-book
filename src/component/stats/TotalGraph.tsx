import ReactECharts from "echarts-for-react";
import { Income, Expense, isExpense } from "../../typedef";
import { useMemo } from "react";

interface GraphProps { transactions: (Income | Expense)[] }
export default function TotalGraph ({ transactions }: GraphProps) {

  const categoryTotals = useMemo(() => {
    let totals: { [key: string]: number } = {};
    transactions.forEach(t => {
      if (totals[t.category] === undefined) totals[t.category] = 0;
      if (isExpense(t)) totals[t.category] -= Math.round(t.amount / 100);
      else totals[t.category] += Math.round(t.amount / 100);
    });
    totals
    return totals;
  }, [transactions]);

  const categories = useMemo(() => Object.keys(categoryTotals).sort((a, b) => categoryTotals[a] - categoryTotals[b]).map(cat => cat.slice(0, 8)), [categoryTotals]);
  const totals = useMemo(() => Object.values(categoryTotals).sort((a, b) => a - b).map(t => new Object({value: t, itemStyle: { color: t > 0 ? '#739d88' : '#f6d6aa' }, label: {normal:{show:true,position:t > 0 ?'top':'bottom',formatter: '${c}'}} })), [categoryTotals]);

  const option = {
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 28,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: { show: true, lineStyle: { color: '#ffffff', }},
    },
    series: [
      {
        data: totals,
        type: 'bar',
        itemStyle: { color: '#739d88' },
      }
    ],
    title: {
      text: 'Total Amounts by Category',
    },
    width: '87%',
    dataZoom: { type: 'inside' },
  }; 

  return (
    <div className='stats-graph'>
      <ReactECharts option={option} />
    </div>
  )
}