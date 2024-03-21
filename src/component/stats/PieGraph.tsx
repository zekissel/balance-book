import ReactECharts from "echarts-for-react";
import { Transaction } from "../../typedef";
import { generateChartColor } from "../../typeassist";
import { useMemo } from "react";

interface GraphProps { transactions: Transaction[], isIncome: boolean }
export default function PieGraph ({ transactions, isIncome }: GraphProps) {

  const categoryTotals = useMemo(() => {
    let totals: { [key: string]: number } = {};
    transactions.forEach(t => {
      if ((isIncome ? 1 : -1) * t.amount > 0 && totals[t.category] === undefined) totals[t.category] = 0;
      if ((isIncome ? 1 : -1) * t.amount > 0) totals[t.category] += Math.abs(t.amount / 100);
    });
    if (Object.keys(totals).length === 0) return { 'No Data': 0 };
    return totals;
  }, [transactions, isIncome]);

  const categories = useMemo(() => Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]).map(cat => cat.slice(0, 10)), [categoryTotals]);
  const totals = useMemo(() => Object.values(categoryTotals).sort((a, b) => b - a), [categoryTotals]);

  //const totalBalance = useMemo(() => { return totals.reduce((acc, t) => acc + t, 0); }, [totals]);

  const option = {
    legend: {
      type: 'scroll',
      orient: "vertical",
      left: "right",
      data: categories,//.map((c, i) => `${c} (${Math.round((totals[i] / totalBalance) * 100)}%)`),
      y: 10,
    },
    series: [
      {
        type: 'pie',
        data: totals.map((t, i) => ({ value: t, name: `${categories[i]}`, itemStyle: { color: totals[0] !== 0 ? generateChartColor(i, isIncome) : '#abc' }})),
        y: 40,
        x: -60,
      }
    ],
    title: {
      text: `${isIncome ? 'Income' : 'Expense'} Percentage by Category`,
      y: 10,
    },
    tooltip: {
      trigger: 'item',
      formatter: 'Category<br/>{b} : ${c} ({d}%)',
    },
  }; 

  return (
    <div className='stats-graph'>
      <ReactECharts option={option} />
    </div>
  )
}