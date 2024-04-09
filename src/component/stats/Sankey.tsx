import ReactECharts from "echarts-for-react";
import { Transaction, Account } from "../../typedef";
import { useMemo } from "react";

interface GraphProps { transactions: Transaction[], accounts: Account[] }
export default function TotalGraph ({ transactions, accounts }: GraphProps) {

  const categoryTotals = useMemo(() => {
    let totals: { [key: string]: number } = {};
    transactions.forEach(t => {
      if (totals[t.category] === undefined) totals[t.category] = 0;
      totals[t.category] += Math.round(t.amount / 100);
    });
    totals
    return totals;
  }, [transactions]);

  const categories = useMemo(() => Object.keys(categoryTotals).sort((a, b) => categoryTotals[a] - categoryTotals[b]), [categoryTotals]);
  
  const nodes = useMemo(() => accounts.map(a => new Object({name: `${a.account_type}:${a.account_name}`})).concat(categories.map(c => new Object({name: c}))), [accounts, categories]);
  const links = useMemo(() => {
    const ret = transactions.map(t => new Object({source: t.amount > 0 ? t.category : `${accounts.find(a => a.id === t.account_id)!.account_type}:${accounts.find(a => a.id === t.account_id)!.account_name}`, target:  t.amount > 0 ? `${accounts.find(a => a.id === t.account_id)!.account_type}:${accounts.find(a => a.id === t.account_id)!.account_name}` : t.category, value: Math.abs(t.amount / 100)}));
    transactions.forEach(t => {
      if (t.amount < 0 && t.category.split('>')[0] === 'Financial' && t.category.split('>').length > 1 && (['Transfer', 'Credit'].includes(t.category.split('>')[1]))) ret.push(new Object({source: `${t.category}`, target: `FinanceIncome>${t.category.split('>')[1]}`, value: Math.abs(t.amount / 100)}));
    })
    return ret;
  }, [transactions, categories]);

  const option = {
    title: {
      text: 'Asset Allocation'
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: '<em>{b}</em> : <b>${c}</b>',
    },
    width: '75%',
    series: [
      {
        type: 'sankey',
        emphasis: {
          focus: 'adjacency'
        },
        nodeAlign: 'right',
        top: '10%',
        bottom: '5%',
        data: nodes,
        links: links,
        lineStyle: {
          color: 'source',
          curveness: 0.4
        }
      }
    ]
  };

  return (
    <div className='stats-graph'>
      <ReactECharts option={option} />
    </div>
  )
}