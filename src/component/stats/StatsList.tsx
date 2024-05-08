import { useMemo, useState } from 'react';
import { Transaction } from '../../typedef';

interface StatsListProps {
	transactions: Transaction[];
	full: boolean;
	toggleFull: () => void;
}
export default function StatsList({ transactions, full, toggleFull }: StatsListProps) {

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
		<div className={'w-full ' + (full ? 'absolute z-250 top-0 left-0 bg-dim h-full ' : 'h-[calc(100%-1.25rem)] relative -z-5 ')} onDoubleClick={toggleFull} >

				<h4 className={'m-0 font-semibold ' + (!full?'text-[#2c2c2cee] ':'text-white text-2xl text-center w-full mb-8 ')}>Statistics by Category</h4>

				<li className={'grid grid-cols-[1.5fr_0.4fr_1fr_1.2fr_1fr_1fr_1fr_0.1fr] rounded-lg bg-light1 text-right text-sm p-0 my-0.5 mx-0.1 border-b-2 border-b-primary border-b-solid ' + (full ? 'w-4/5 mx-auto ' : 'w-full')}>

					<h5 className='font-semibold mr-auto ml-0.5 rounded-lg p-0.5 hover:bg-bbgray1 ' onClick={() => handleSort('category')}>Category</h5>

					<span className='font-semibold rounded-lg p-0.5 hover:bg-bbgray1 ' onClick={() => handleSort('count')}>Count</span>

					<span className='font-semibold rounded-lg p-0.5 ml-auto hover:bg-bbgray1 ' onClick={() => handleSort('total')}>Total</span>

					<span className='font-semibold rounded-lg p-0.5 ml-auto hover:bg-bbgray1 ' onClick={() => handleSort('avg')}>Avg</span>

					<span className='font-semibold rounded-lg p-0.5 ml-auto hover:bg-bbgray1 ' onClick={() => handleSort('min')}>Min</span>

					<span className='font-semibold rounded-lg p-0.5 ml-auto hover:bg-bbgray1 ' onClick={() => handleSort('med')}>Median</span>

					<span className='mr-1 font-semibold rounded-lg p-0.5 ml-auto hover:bg-bbgray1 ' onClick={() => handleSort('max')}>Max</span>

				</li>

				<ul className='w-full h-[calc(80%)] overflow-hidden overflow-y-scroll '>
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
								<li key={s} className={'grid grid-cols-[1.5fr_0.4fr_1fr_1.2fr_1fr_1fr_1fr_0.1fr] rounded-lg text-right text-sm p-0 my-0.5 mx-0.1 border-b border-dashed border-b-bbgray3 ' + (full ? 'text-white w-4/5 mx-auto ':'w-full ')}>
									<h5 className={'mr-auto ml-1.5 rounded-lg px-0.5 ' + (['Transfer', 'Credit'].includes(s.split('>')[1]) ? 'bg-neutral3' : (categoryStats[s].total > 0 ? 'bg-primary3 ' : 'bg-negative2 '))}>{s.replace('Income', '')}</h5>
									<span> {categoryStats[s].count}</span>
									<span className='font-mono '>
										{' '}
										{categoryStats[s].total > 0 ? '+$' : '-$'}
										{Math.round(Math.abs(categoryStats[s].total / 100))}
									</span>
									<span className='font-mono '>
										{' '}
										{categoryStats[s].total > 0 ? '+$' : '-$'}
										{Math.abs(categoryStats[s].avg / 100).toFixed(2)}
									</span>

									<span className='font-mono '>
										{' '}
										{categoryStats[s].total > 0 ? '+$' : '-$'}
										{Math.round(categoryStats[s].min / 100)}
									</span>
									<span className='font-mono '>
										{' '}
										{categoryStats[s].total > 0 ? '+$' : '-$'}
										{Math.round(Math.abs(categoryStats[s].med / 100))}
									</span>
									<span className='font-mono '>
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

			</div>
	);
}
