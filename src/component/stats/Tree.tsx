import ReactECharts from 'echarts-for-react';
import { Transaction, Account } from '../../typedef';
import { useMemo } from 'react';

interface GraphProps {
	transactions: Transaction[];
	accounts: Account[];
}
export default function Tree({ transactions, accounts }: GraphProps) {
	const categoryTotals = useMemo(() => {
		const totals: { [key: string]: number } = {};
		transactions.forEach((t) => {
			if (totals[t.category] === undefined) totals[t.category] = 0;
			totals[t.category] += Math.round(t.amount / 100);
		});
		totals;
		return totals;
	}, [transactions]);

	const categories = useMemo(
		() => Object.keys(categoryTotals).sort((a, b) => categoryTotals[a] - categoryTotals[b]
	), [categoryTotals]);

	

	const option = {};

	return (
		<div className="stats-graph">
			<ReactECharts option={option} />
		</div>
	);
}
