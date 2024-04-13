import { useMemo, useState } from 'react';
import { Transaction, Account } from '../../typedef';
import TotalGraph from './TotalGraph';
import PieGraph from './PieGraph';
import LineGraph from './LineGraph';
import BarGraph from './BarGraph';
import HeatMap from './HeatMap';
import Sankey from './Sankey';
import TreeGraph from './TreeGraph';
import BoxPlot from './BoxPlot';

interface StatsPageProps {
	transactions: Transaction[];
	accounts: Account[];
	upcoming: Transaction[];
	startDate: Date;
	endDate: Date;
	showFilter: boolean;
}
export default function StatsPage({
	transactions,
	accounts,
	upcoming,
	startDate,
	endDate,
	showFilter,
}: StatsPageProps) {
	const netBalance = useMemo(
		() => transactions.reduce((acc, t) => acc + t.amount, 0),
		[transactions],
	);
	const upcomingTotal = useMemo(
		() => upcoming.reduce((acc, t) => acc + t.amount / 100, 0),
		[upcoming],
	);

	const numExpenses = useMemo(() => {
		return transactions.filter(
			(t) => t.amount < 0 && !['Credit', 'Transfer'].includes(t.category.split('>')[1]),
		).length;
	}, [transactions]);
	const expenseTotal = useMemo(() => {
		return transactions
			.filter((t) => t.amount < 0 && !['Credit', 'Transfer'].includes(t.category.split('>')[1]))
			.reduce((acc, t) => acc - t.amount, 0);
	}, [transactions]);

	const numIncome = useMemo(() => {
		return transactions.filter(
			(t) => t.amount > 0 && !['Credit', 'Transfer'].includes(t.category.split('>')[1]),
		).length;
	}, [transactions]);
	const incomeTotal = useMemo(() => {
		return transactions
			.filter((t) => t.amount > 0 && !['Credit', 'Transfer'].includes(t.category.split('>')[1]))
			.reduce((acc, t) => acc + t.amount, 0);
	}, [transactions]);

	const [historyGraphLine, setHistoryGraphLine] = useState(
		localStorage.getItem('stats.historyGraphLine') === 'true' ? true : false,
	);
	const [categoryPieTypeIncome, setCatPieTypeIncome] = useState<boolean>(
		localStorage.getItem('stats.categoryPieIncome') === 'true' ? true : false,
	);
	const [boxTypeInc, setBoxTypeInc] = useState<boolean>(
		localStorage.getItem('stats.boxTypeInc') === 'true' ? true : false,
	);

	const [categoryChartType, setCategoryChartType] = useState(
		localStorage.getItem('stats.categoryChartType') !== null
			? Number(localStorage.getItem('stats.categoryChartType'))
			: 0,
	);
	const cycleCategoryChart = (direction: number) => {
		let index = (categoryChartType + (direction > 0 ? 1 : -1)) % 3;
		if (index < 0) index = 2;
		setCategoryChartType(index);
		localStorage.setItem('stats.categoryChartType', index.toString());
	};

	return (
		<div className={showFilter ? 'main-down-shift page-main' : 'page-main'}>
			<div className="stats-main-row">
				<div className="stats-main-box-short">
					<h3>
						Net Balance:{' '}
						<span id="stats-main-net" style={netBalance === 0 ? netNeutral : (netBalance > 0 ? netStyleProfit : netStyleLoss)}>
							{netBalance >= 0
								? `+$${(netBalance / 100).toFixed(2)}`
								: `-$${(netBalance / -100).toFixed(2)}`}
						</span>
					</h3>
					<i>
						Since {startDate.toDateString()}
						{endDate && ','}
					</i>
					{endDate && <i>Until {endDate.toDateString()}</i>}
					<div className="stats-main-info">
						<p>
							Total expense: -${expenseTotal / 100} ({numExpenses})
						</p>
						<p>
							Total income: +${incomeTotal / 100} ({numIncome})
						</p>
					</div>
					{upcoming.length > 0 && (
						<span>
							Upcoming: {upcomingTotal > 0 ? '+$' : '-$'}
							{Math.abs(upcomingTotal)} ({upcoming.length})
						</span>
					)}
				</div>

				<div className="stats-main-box-long">
					<TotalGraph transactions={transactions} />
				</div>
			</div>

			<div className="stats-main-row">
				<div className="stats-main-box-longer">
					{historyGraphLine && (
						<LineGraph
							transactions={transactions}
							range={Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}
							endDate={endDate}
						/>
					)}
					{!historyGraphLine && (
						<BarGraph
							transactions={transactions}
							range={Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}
							endDate={endDate}
						/>
					)}

					<div className="stats-menu-sep">
						<button onClick={() => setHistoryGraphLine(!historyGraphLine)}>
							<img src={historyGraphLine ? '/bar.svg' : 'line.svg'} />
						</button>
					</div>
				</div>

				<div className="stats-main-box-shorter">
					{categoryChartType === 0 && (
						<PieGraph transactions={transactions} isIncome={categoryPieTypeIncome} />
					)}
					{categoryChartType !== 0 && (
						<TreeGraph
							trans={transactions}
							treemap={categoryChartType === 1}
							income={categoryPieTypeIncome}
						/>
					)}
					<div className="stats-menu-sep">
						<div className="stats-category-radio">
							<input
								type="radio"
								id="radio-category-income"
								name="type"
								onChange={() => {
									setCatPieTypeIncome(true);
									localStorage.setItem('stats.categoryPieIncome', 'true');
								}}
								defaultChecked={categoryPieTypeIncome}
							/>
							<label htmlFor="radio-category-income">Income</label>
							<input
								type="radio"
								id="radio-category-expense"
								name="type"
								onChange={() => {
									setCatPieTypeIncome(false);
									localStorage.setItem('stats.categoryPieIncome', 'false');
								}}
								defaultChecked={!categoryPieTypeIncome}
							/>
							<label htmlFor="radio-category-expense">Expense</label>
						</div>

						<span>
							<button onClick={() => cycleCategoryChart(-1)}>
								<img
									src={
										categoryChartType === 0
											? '/burst.svg'
											: categoryChartType === 1
												? '/pie.svg'
												: '/map.svg'
									}
								/>
							</button>
							<button onClick={() => cycleCategoryChart(1)}>
								<img
									src={
										categoryChartType === 0
											? '/map.svg'
											: categoryChartType === 1
												? '/burst.svg'
												: '/pie.svg'
									}
								/>
							</button>
						</span>
					</div>
				</div>
			</div>

			<div className="stats-main-row">
				<div className="stats-main-box-shorter">
					<BoxPlot trans={transactions} isIncome={boxTypeInc} />
					<div className="stats-category-radio">
						<input
							type="radio"
							id="radio-box-income"
							name="box"
							onChange={() => {
								setBoxTypeInc(true);
								localStorage.setItem('stats.boxTypeInc', 'true');
							}}
							defaultChecked={boxTypeInc}
						/>
						<label htmlFor="radio-box-income">Income</label>
						<input
							type="radio"
							id="radio-box-expense"
							name="box"
							onChange={() => {
								setBoxTypeInc(false);
								localStorage.setItem('stats.boxTypeInc', 'false');
							}}
							defaultChecked={!boxTypeInc}
						/>
						<label htmlFor="radio-box-expense">Expense</label>
					</div>
				</div>

				<div className="stats-main-box-longer">
					<Sankey transactions={transactions} accounts={accounts} />

					{false && <HeatMap transactions={transactions} startDate={startDate} endDate={endDate} />}
				</div>
			</div>
		</div>
	);
}

const netStyleLoss = { color: '#6d1e1e' };
const netStyleProfit = { color: '#1e6d58' };
const netNeutral = { color: '#6a92ba' };