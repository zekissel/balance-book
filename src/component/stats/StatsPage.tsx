import { useMemo, useState } from "react";
import { Expense, Income, isExpense } from "../../typedef";
import { addDays } from "../../typeassist";
import TotalGraph from "./TotalGraph";
import PieIncomeGraph from "./PieIncomeGraph";
import PieExpenseGraph from "./PieExpenseGraph";
import LineGraph from "./LineGraph";

interface StatsPageProps { transactions: (Income | Expense)[], timeRange: number, endDate: Date | null, showFilter: boolean }
export default function StatsPage ({ transactions, timeRange, endDate, showFilter }: StatsPageProps) {

  const modifedTransactions = useMemo(() => {
    if (timeRange === 0) return transactions;
    const end = new Date((endDate ?? new Date()).toDateString()).getTime();
    return transactions.filter(t => (end - t.date.getTime()) < (timeRange * 24 * 60 * 60 * 1000));
  }, [transactions, timeRange]);

  const netBalance = useMemo(() => {
    return modifedTransactions.reduce((acc, t) => acc + (t.amount * (isExpense(t) ? -1 : 1)), 0);
  }, [modifedTransactions]);

  const minDate = useMemo(() => {
    if (timeRange === 0) return new Date(Math.min(...modifedTransactions.map(t => t.date.getTime())));
    const stop = ( endDate ?? new Date());
    return new Date(new Date(stop.getTime() - (timeRange * 24 * 60 * 60 * 1000)).toDateString());
  }, [timeRange, modifedTransactions]);

  const numExpenses = useMemo(() => {
    return modifedTransactions.filter(t => isExpense(t)).length;
  }, [modifedTransactions]);
  const expenseTotal = useMemo(() => {
    return modifedTransactions.filter(t => isExpense(t)).reduce((acc, t) => acc + t.amount, 0);
  }, [modifedTransactions]);

  const numIncome = useMemo(() => {
    return modifedTransactions.filter(t => !isExpense(t)).length;
  }, [modifedTransactions]);
  const incomeTotal = useMemo(() => {
    return modifedTransactions.filter(t => !isExpense(t)).reduce((acc, t) => acc + t.amount, 0);
  }, [modifedTransactions]);



  const [categoryPieTypeIncome, setCatPieTypeIncome] = useState(true);


  return (
    <div className={ showFilter ? 'main-down-shift page-main' : 'page-main'}>
      <div className='stats-main-row'>
        <div className='stats-main-box-short'>
          <h3>
            Net Balance: <span id='stats-main-net' style={netBalance > 0 ? netStyleProfit : netStyleLoss}>{ netBalance > 0 ? `+$${(netBalance / 100).toFixed(2)}` : `-$${(netBalance / -100).toFixed(2)}` }</span>
          </h3>
          <i>Since { addDays(minDate, 1).toDateString() }{ endDate && ',' }</i>
          { endDate && <i>Until { endDate.toDateString() }</i> }
          <div className='stats-main-info'>
            <p>Total expenses: -${ expenseTotal / 100 } ({ numExpenses } transactions)</p>
            <p>Total income: +${ incomeTotal / 100 } ({ numIncome } transactions)</p>
          </div>
        </div>
      
        <div className='stats-main-box-long'>
          <TotalGraph transactions={modifedTransactions} />
        </div>
      </div>
      
      <div className='stats-main-row'>
        <div className='stats-main-box-longer'>
          <LineGraph transactions={modifedTransactions} range={timeRange > 0 ? timeRange : Math.round(((endDate ?? new Date()).getTime() - minDate.getTime() + (2*24*60*60*1000)) / (24 * 60 * 60 * 1000))} endDate={endDate} />
        </div>

        <div className='stats-main-box-shorter'>
          { categoryPieTypeIncome ?
            <PieIncomeGraph transactions={modifedTransactions} /> 
          :
            <PieExpenseGraph transactions={modifedTransactions} />
          }
          <div className='stats-category-radio'>
            <input type='radio' id='radio-category-income' name='type' onChange={() => setCatPieTypeIncome(true)} defaultChecked /><label htmlFor='radio-category-income'>Income</label>
            <input type='radio' id='radio-category-expense' name='type' onChange={() => setCatPieTypeIncome(false)} /><label htmlFor='radio-category-expense'>Expense</label>
          </div>
        </div>
      </div>

      <div className='stats-main-row'>
        <div className='stats-main-box-shorter'>
          graph
        </div>
      
        <div className='stats-main-box-longer'>
          graph
        </div>
      </div>
    </div>
  )
}

const netStyleLoss = { color: '#6d1e1e' };
const netStyleProfit = { color: '#1e6d58' };