import ReactECharts from 'echarts-for-react';
import { Transaction } from '../../typedef';
import { useMemo, useState } from 'react';

interface GraphProps { trans: Transaction[], isIncome: boolean, root: string | null }
export default function BoxPlot({ trans, isIncome, root }: GraphProps) {

  const transactions = useMemo(() => {
    return (isIncome ? trans.filter(t => t.amount > 0)
      : trans.filter(t => t.amount < 0)).filter(t => !['Transfer', 'Credit'].includes(t.category.split('>')[1]));
  }, [trans, isIncome]);

	const categoryTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
    if (root) {
      transactions.filter(t => t.category.includes('>') && t.category.split('>')[0] === root).forEach((t) => {
        if (totals[t.category.split('>')[1]] === undefined) totals[t.category.split('>')[1]] = 0;
        totals[t.category.split('>')[1]] += Math.round(t.amount / 100);
      });

    } else {

      transactions.filter(t => t.category.includes('>')).forEach((t) => {
        if (totals[t.category.split('>')[0]] === undefined) totals[t.category.split('>')[0]] = 0;
        totals[t.category.split('>')[0]] += Math.round(t.amount / 100);
      });
    }
		return totals;
	}, [transactions, root]);

  const categories = useMemo(() => {
    return Object.keys(categoryTotals);
  }, [categoryTotals]);

  const [outliers, setOutliers] = useState<number[][]>([]);

  const source = useMemo(() => {
    setOutliers([]);
    const out: number[][] = [];
    const ret = Array.from({ length: categories.length }, (_, i) => {
      const relevant: number[] = (root ? transactions.filter((t) => (t.category.split('>')[0] === root) && (t.category.split('>')[1] === categories[i])) : transactions.filter((t) => t.category.split('>')[0] === categories[i])).map(t => Math.abs(t.amount / 100)).sort((a, b) => a - b);
      //const relevant = transactions.filter((t) => t.category.split('>')[0] === categories[i]).map(t => Math.abs(t.amount / 100)).sort((a, b) => a - b);

      const q1 = relevant[Math.floor((relevant.length - 1) * .25)];
      const median = relevant[Math.floor(relevant.length / 2)];
      const q3 = relevant[Math.ceil((relevant.length - 1) * .75)];
      
      const iqr = q3 - q1;
      const low = Math.max((q1 - (1.5 * iqr)), 0);
      const high = q3 + (1.5 * iqr);
      //const min = Math.min(...relevant);
      //const max = Math.max(...relevant);
      
      const outside = relevant.filter((r) => r < low || r > high).map(r => [r, categories.findIndex(c => c === categories[i])]);
      
      for (const coord of outside) {
        if (!out.some(o => o[0] === coord[0] && o[1] === coord[1])) out.push(coord);
      }
      
      return [low, q1, median, q3, high];
		})
    setOutliers(out);
    return ret;
  }, [transactions, categories, root]);

	const option = {
    title: { 
      text: `${isIncome ? 'Income': 'Expense'} Spread by Category`,
      top: 10,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '14%',
      right: '11%',
      bottom: '6%',
      top: '11%'
    },
    yAxis: {
      type: 'category',
      data: Object.keys(categoryTotals).map(c => new Object({ value: c.slice(0, 9)})),
      splitLine: {
        show: false
      }
    },
    xAxis: {
      type: 'value',
      name: 'Dollars',
      nameLocation: 'end',
      splitArea: {
        show: true
      }
    },
    series: [
      {
        name: 'IQR Spread',
        type: 'boxplot',
        data: source,
        itemStyle: { 
          color: (isIncome ? '#739d8877' : '#f6d6aa77'),
          borderColor: (isIncome ? '#405c4e' : '#635645'),
        },
      },
      {
        name: 'Outlier',
        type: 'scatter',
        data: outliers,
        itemStyle: {
          color: (isIncome ? '#405c4e' : '#69553b'),
        },
      }
    ],
    dataZoom: { 
      type: 'inside',
    },
  };
  
  
	return (
		<div className="stats-graph">
			<ReactECharts option={option} />
		</div>
	);
}
