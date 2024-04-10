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
  
  const nodes = useMemo(() => {
    const ids = transactions.map(t => t.account_id);
    const accts = accounts.filter(a => ids.includes(a.id));

    const ret = accts.map(a => new Object({
      name: `${a.account_type}:${a.account_name}`
    })).concat(categories.filter(c => c.split('>').length > 1 && !['Transfer', 'Credit'].includes(c.split('>')[1])).map(c => new Object({name: c})));

    return ret;
  }, [accounts, categories]);
  const links = useMemo(() => {
    type Link = { source: string, target: string, value: number }

    const ret: Link[] = transactions.filter(t => t.category.includes('>') && !['Transfer', 'Credit'].includes(t.category.split('>')[1])).map(t => {
      const acct = accounts.find(a => a.id === t.account_id)!;
      
      return new Object({
        source: t.amount > 0 ? t.category: `${acct.account_type}:${acct.account_name}`, 
        target: t.amount > 0 ? `${acct.account_type}:${acct.account_name}`: t.category,
        value: Math.abs(t.amount / 100)
      }) as Link;
      
    });

    const connect: Link[] = transactions.filter(t => (t.category.split('>')[0] === 'Financial') && (t.category.split('>').length > 1) && ['Transfer', 'Credit'].includes(t.category.split('>')[1])).map(t => {
      const acct = accounts.find(a => a.id === t.account_id)!;
      return new Object({
        source: `${acct.account_type}:${acct.account_name}`,
        target: t.category.split('>')[1],
        value: Math.abs(t.amount / 100)
      }) as Link;
    })
    transactions.filter(t => (t.category.split('>')[0] === 'FinanceIncome') && (t.category.split('>').length > 1) && ['Transfer', 'Credit'].includes(t.category.split('>')[1])).forEach(t => {
      const acct = accounts.find(a => a.id === t.account_id)!;
      
      const link = connect.find((c: Link) => c.value === Math.abs(t.amount / 100));
      if (link) link.target = `${acct.account_type}:${acct.account_name}`;
      else connect.push(new Object({
        source: t.category.split('>')[1],
        target: `${acct.account_type}:${acct.account_name}`,
        value: Math.abs(t.amount / 100)
      }) as Link);

    });

    return ret.concat(connect);
  }, [transactions, categories, accounts]);

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