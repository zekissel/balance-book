import ReactECharts from "echarts-for-react";
import { Income, Expense, isExpense } from "../../typedef";
import '../../styles/Graph.css'
import { useMemo } from "react";

interface GraphProps { transactions: (Income | Expense)[] }
export default function TotalGraph ({ transactions }: GraphProps) {

  const categoryTotals = useMemo(() => {
    let totals: { [key: string]: number } = {};
    transactions.forEach(t => {
      if (totals[t.category] === undefined) totals[t.category] = 0;
      if (isExpense(t)) totals[t.category] -= (t.amount / 100);
      else totals[t.category] += (t.amount / 100);
    });
    return totals;
  }, [transactions]);

  const categories = useMemo(() => Object.keys(categoryTotals).map(cat => cat.slice(0, 10)), [categoryTotals]);
  const totals = useMemo(() => Object.values(categoryTotals).map(t => new Object({value: t, itemStyle: { color: t > 0 ? '#739d88' : '#f6d6aa' }, label: {normal:{show:true,position:t > 0 ?'top':'bottom',}} })), [categoryTotals]);

  const option = {
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 35,
      },
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: totals,
        type: 'bar',
        itemStyle: { color: '#739d88' },
      }
    ],
    title: {
      text: 'Category Totals',
    }
  }; 

  return (
    <div className='stats-graph'>
      <ReactECharts option={option} />
    </div>
  )
}