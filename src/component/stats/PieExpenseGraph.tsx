import ReactECharts from "echarts-for-react";
import { Income, Expense, isExpense } from "../../typedef";
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

  const categories = useMemo(() => Object.keys(categoryTotals).map(cat => cat.slice(0, 10)), [categoryTotals]);
  const totals = useMemo(() => Object.values(categoryTotals), [categoryTotals]);

  const netExpense = useMemo(() => { return totals.reduce((acc, t) => acc + t, 0); }, [totals]);

  function generateRandomColor() {
    const letters = '789ABCDEF';
    let color = 'e2cb64';
    let color2 = 'f6d6aa';
    color = Math.random() > .5 ? (parseInt(color, 16) + 0x111111).toString(16) : (parseInt(color2, 16) - 0x111111).toString(16);

    for (let i = 0; i < 2; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
      color2 += letters[Math.floor(Math.random() * letters.length)];
    }

    return `#${Math.random() < .5 ? color : color2}`;
  }

  const option = {
    legend: {
      orient: "vertical",
      left: "right",
      data: categories.map((c, i) => `${c} (${Math.round((totals[i] / netExpense) * 100)})`),
    },
    series: [
      {
        type: 'pie',
        data: totals.map((t, i) => ({ value: t, name: `${categories[i]} (${Math.round((t / netExpense) * 100)})`, itemStyle: { color: generateRandomColor() }})),
        y: 15,
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