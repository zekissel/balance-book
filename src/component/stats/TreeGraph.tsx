import ReactECharts from "echarts-for-react";
import { Transaction } from "../../typedef";
import { useMemo } from "react";

interface GraphProps { trans: Transaction[], treemap: boolean, income: boolean }
export default function TreeGraph ({ trans, treemap, income }: GraphProps) {


  const transactions = useMemo(() => {
    return trans.filter(t => t.category.includes('>'));
  }, [trans]);

  const trunkTotals = useMemo(() => {
    let totals: { [key: string]: number } = {};
    transactions.forEach(t => {
      if (totals[t.category.split('>')[0]] === undefined) totals[t.category.split('>')[0]] = 0;
      totals[t.category.split('>')[0]] += Math.round((income ? 1: -1) * t.amount / 100);
    });
    return totals;
  }, [transactions, income]);

  const categoryTotals = useMemo(() => {
    let totals: { [key: string]: number } = {};
    transactions.forEach(t => {
      if (totals[t.category] === undefined) totals[t.category] = 0;
      totals[t.category] += Math.round((income ? 1: -1) * t.amount / 100);
    });
    totals
    return totals;
  }, [transactions, income]);

  type MapData = { name: string, size: number, children: MapData[], value: number }
  const data = useMemo(() => {
    const trunks = Object.keys(trunkTotals);

    const ret = trunks.map((c) => new Object({ name: c, size: trunkTotals[c], value: trunkTotals[c], children: [] }) as MapData);

    Object.keys(categoryTotals).forEach((t) => {
      const index = ret.findIndex(r => r.name === t.split('>')[0]);
      if (index !== -1) {
        ret[index].children!.push(new Object({ name: t.split('>')[1] === 'Other' ? t : t.split('>')[1], size: categoryTotals[t], value: categoryTotals[t] }) as MapData);
      }
    
    })

    return ret;
  }, [categoryTotals, trunkTotals]);

  const treemapOption = {
    title: {
      text: `${income ? 'Income' : 'Expense'} Totals by Category`,
      y: 10,
    },
    series: [
      {
        type: 'treemap',
        top: 35,
        animationDurationUpdate: 1000,
        roam: false,
        nodeClick: 'zoomToNode',
        data: data,
        universalTransition: true,
        label: {
          show: true,
          formatter: '{b}: ${c}',
        },
        breadcrumb: {
          show: false
        }
      }
    ],
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <b>${c}</b>',
    },
  };
  const sunburstOption = {
    title: {
      text: `${income ? 'Income' : 'Expense'} Totals by Category`,
      y: 10,
    },
    series: [
      {
        type: 'sunburst',
        radius: ['15%', '82%'],
        center: ['50%', '60%'],
        animationDurationUpdate: 1000,
        nodeClick: 'rootToNode',
        data: data,
        universalTransition: true,
        itemStyle: {
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,.5)'
        },
        label: {
          show: true,
          formatter: '{b}',
        }
      }
    ],
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <b>${c}</b>',
    },
  };

  const option = useMemo(() => {
    return treemap ? treemapOption : sunburstOption;
  }, [treemap, income, trans]);

  return (
    
    <div className='stats-graph'>
      <ReactECharts option={option} />
    </div>
  )
}