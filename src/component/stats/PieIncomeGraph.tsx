import ReactECharts from "echarts-for-react";
import { Income, Expense, isExpense } from "../../typedef";
import { generateRandomColor } from "../../typeassist";
import '../../styles/Graph.css'
import { useMemo } from "react";

interface GraphProps { transactions: (Income | Expense)[] }
export default function PieIncomeGraph ({ transactions }: GraphProps) {

  const categoryTotals = useMemo(() => {
    let totals: { [key: string]: number } = {};
    transactions.forEach(t => {
      if (!isExpense(t) && totals[t.category] === undefined) totals[t.category] = 0;
      if (!isExpense(t)) totals[t.category] += (t.amount / 100);
    });
    return totals;
  }, [transactions]);

  const categories = useMemo(() => Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]).map(cat => cat.slice(0, 10)), [categoryTotals]);
  const totals = useMemo(() => Object.values(categoryTotals).sort((a, b) => b - a), [categoryTotals]);

  const netIncome = useMemo(() => { return totals.reduce((acc, t) => acc + t, 0); }, [totals]);


  const option = {
    legend: {
      orient: "vertical",
      left: "right",
      data: categories.map((c, i) => `${c} (${Math.round((totals[i] / netIncome) * 100)}%)`),
      y: 10,
    },
    series: [
      {
        type: 'pie',
        data: totals.map((t, i) => ({ value: t, name: `${categories[i]} (${Math.round((t / netIncome) * 100)}%)`, itemStyle: { color: generateRandomColor('739d88', '93ceb4', true) }})),
        y: 40,
        x: -60,
      }
    ],
    title: {
      text: 'Income Percentage by Category',
      y: 10,
    }
  }; 

  return (
    <div className='stats-graph'>
      <ReactECharts option={option} />
    </div>
  )
}