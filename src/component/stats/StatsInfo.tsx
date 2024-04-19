import { useMemo, useState } from 'react';
import { Account, Transaction } from '../../typedef';

interface StatsPageProps {
	transactions: Transaction[];
	accounts: Account[];
}
export default function StatsInfo({ transactions, accounts }: StatsPageProps) {
	type stat = { avg: number; total: number; count: number; max: number; med: number; min: number };
	interface catStat {
		[key: string]: stat;
	}

	const categoryStats = useMemo(() => {
		const ret: catStat = {};
		transactions.forEach((t) => {
			if (ret[t.category] === undefined) {
				ret[t.category] = {
					avg: 0,
					total: 0,
					count: 0,
					max: Number.MIN_SAFE_INTEGER,
					med: 0,
					min: Number.MAX_SAFE_INTEGER,
				};
			}
			ret[t.category].total += t.amount;
			ret[t.category].count++;
			ret[t.category].avg = ret[t.category].total / ret[t.category].count;
			if (Math.abs(t.amount) > ret[t.category].max) ret[t.category].max = Math.abs(t.amount);
			if (Math.abs(t.amount) < ret[t.category].min) ret[t.category].min = Math.abs(t.amount);
		});

		Object.keys(ret).forEach((k) => {
			const vals = transactions.filter((t) => t.category === k).map((t) => Math.abs(t.amount));
			vals.sort((a, b) => a - b);
			if (vals.length % 2 === 0) {
				ret[k].med = (vals[vals.length / 2] + vals[vals.length / 2 - 1]) / 2;
			} else {
				ret[k].med = vals[Math.floor(vals.length / 2)];
			}
		});

		return ret;
	}, [transactions]);

	const [sortBy, setSortBy] = useState('count');
	const handleSort = (val: string) => {
		if (val === sortBy) {
			setSortBy(`!${val}`);
		} else {
			setSortBy(val);
		}
	};

	return (
		<div className="stats-stats">
			<h4>Statistics by Category</h4>

			<li className="info-head">
				<h5 onClick={() => handleSort('category')}>Category</h5>
				<span onClick={() => handleSort('count')}>Count</span>
				<span onClick={() => handleSort('total')}>Total</span>
				<span onClick={() => handleSort('avg')}>Avg</span>
				<span onClick={() => handleSort('min')}>Min</span>
				<span onClick={() => handleSort('med')}>Median</span>
				<span onClick={() => handleSort('max')}>Max</span>
			</li>

			<ul>
				{Object.keys(categoryStats)
					.sort((a, b) => {
						switch (sortBy) {
							case 'category':
								return a.localeCompare(b);
							case '!category':
								return b.localeCompare(a);
							case 'total':
								return categoryStats[b].total - categoryStats[a].total;
							case '!total':
								return categoryStats[a].total - categoryStats[b].total;
							case 'avg':
								return categoryStats[b].avg - categoryStats[a].avg;
							case '!avg':
								return categoryStats[a].avg - categoryStats[b].avg;
							case 'max':
								return (
									(categoryStats[b].total < 0 ? -1 : 1) * categoryStats[b].max -
									(categoryStats[a].total < 0 ? -1 : 1) * categoryStats[a].max
								);
							case '!max':
								return (
									(categoryStats[a].total < 0 ? -1 : 1) * categoryStats[a].max -
									(categoryStats[b].total < 0 ? -1 : 1) * categoryStats[b].max
								);
							case 'min':
								return (
									(categoryStats[b].total < 0 ? -1 : 1) * categoryStats[b].min -
									(categoryStats[a].total < 0 ? -1 : 1) * categoryStats[a].min
								);
							case '!min':
								return (
									(categoryStats[a].total < 0 ? -1 : 1) * categoryStats[a].min -
									(categoryStats[b].total < 0 ? -1 : 1) * categoryStats[b].min
								);
							case 'med':
								return (
									(categoryStats[b].total < 0 ? -1 : 1) * categoryStats[b].med -
									(categoryStats[a].total < 0 ? -1 : 1) * categoryStats[a].med
								);
							case '!med':
								return (
									(categoryStats[a].total < 0 ? -1 : 1) * categoryStats[a].med -
									(categoryStats[b].total < 0 ? -1 : 1) * categoryStats[b].med
								);
							case 'count':
								return categoryStats[b].count - categoryStats[a].count;
							case '!count':
								return categoryStats[a].count - categoryStats[b].count;
							default:
								return categoryStats[b].count - categoryStats[a].count;
						}
					})
					.map((s) => {
						return (
							<li className={categoryStats[s].total > 0 ? 'info-inc' : 'info-exp'}>
								<h5>{s.replace('Income', '')}</h5>
								<span> {categoryStats[s].count}</span>
								<span>
									{' '}
									{categoryStats[s].total > 0 ? '+$' : '-$'}
									{Math.round(Math.abs(categoryStats[s].total / 100))}
								</span>
								<span>
									{' '}
									{categoryStats[s].total > 0 ? '+$' : '-$'}
									{Math.abs(categoryStats[s].avg / 100).toFixed(2)}
								</span>

								<span>
									{' '}
									{categoryStats[s].total > 0 ? '+$' : '-$'}
									{Math.round(categoryStats[s].min / 100)}
								</span>
								<span>
									{' '}
									{categoryStats[s].total > 0 ? '+$' : '-$'}
									{Math.round(Math.abs(categoryStats[s].med / 100))}
								</span>
								<span>
									{' '}
									{categoryStats[s].total > 0 ? '+$' : '-$'}
									{Math.round(categoryStats[s].max / 100)}
								</span>
							</li>
						);
					})}

				<li id="info-placeholder"></li>
				<li id="info-placeholder"></li>
			</ul>

			{transactions.length}
			{accounts.length}
		</div>
	);
}
