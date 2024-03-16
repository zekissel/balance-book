import ReactECharts from "echarts-for-react";
import { Income, Expense, isExpense, generateRandomColor } from "../../typedef";
import '../../styles/Graph.css'
import { useMemo } from "react";

interface GraphProps { transactions: (Income | Expense)[] }
export default function PieExpenseGraph ({ transactions }: GraphProps) {

  const categoryTotals = useMemo(() => {
    let totals: { [key: string]: number } = {};
    transactions.forEach(t => {
      if (isExpense(t) && totals[t.category] === undefined) totals[t.category] = 0;
      if (isExpense(t)) totals[t.category] += (t.amount / 100);
    });
    return totals;
  }, [transactions]);

  const categories = useMemo(() => Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]).map(cat => cat.slice(0, 10)), [categoryTotals]);
  const totals = useMemo(() => Object.values(categoryTotals).sort((a, b) => b - a), [categoryTotals]);
  const netExpense = useMemo(() => { return totals.reduce((acc, t) => acc + t, 0); }, [totals]);


  const option = {
    legend: {
      orient: "vertical",
      left: "right",
      data: categories.map((c, i) => `${c} (${Math.round((totals[i] / netExpense) * 100)}%)`),
    },
    series: [
      {
        type: 'pie',
        data: totals.map((t, i) => ({ value: t, name: `${categories[i]} (${Math.round((t / netExpense) * 100)}%)`, itemStyle: { color: generateRandomColor('e2cb64', 'f6d6aa', false) }})),
        y: 30,
        x: -70,
      }
    ],
    title: {
      text: 'Expense Total by Category',
    }
  }; 

  return (
    <div className='stats-graph' onClick={() => console.log(option)}>
      <ReactECharts option={option} />
    </div>
  )
}