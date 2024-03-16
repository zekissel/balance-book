import { useMemo, useState } from "react";
import { Expense, Income, isExpense } from "../../typedef";
import TotalGraph from "./TotalGraph";
import PieIncomeGraph from "./PieIncomeGraph";
import PieExpenseGraph from "./PieExpenseGraph";
import LineGraph from "./LineGraph";

interface StatsPageProps { transactions: (Income | Expense)[], timeRange: number }
export default function StatsPage ({ transactions, timeRange }: StatsPageProps) {

  const modifedTransactions = useMemo(() => {
    const now = new Date(new Date().toDateString()).getTime();
    return transactions.filter(t => (now - t.date.getTime()) < (timeRange * 24 * 60 * 60 * 1000));
  }, [transactions, timeRange]);

  const netBalance = useMemo(() => {
    return modifedTransactions.reduce((acc, t) => acc + (t.amount * (isExpense(t) ? -1 : 1)), 0);
  }, [modifedTransactions]);

  const minDate = useMemo(() => {
    const now = new Date();
    return new Date(new Date(now.getTime() - (timeRange * 24 * 60 * 60 * 1000)).toDateString());
  }, [timeRange]);

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
    <div className='stats-main'>
      <div className='stats-main-row'>
        <div className='stats-main-box'>
          <h3>
            Net Balance: <span id='stats-main-net' style={netBalance > 0 ? netStyleProfit : netStyleLoss}>{ netBalance > 0 ? `+$${(netBalance / 100).toFixed(2)}` : `-$${(netBalance / -100).toFixed(2)}` }</span>
          </h3>
          <i>Since { minDate.toDateString() }</i>
          <div className='stats-main-info'>
            <p>Total expenses: -${ expenseTotal / 100 } ({ numExpenses } transactions)</p>
            <p>Total income: +${ incomeTotal / 100 } ({ numIncome } transactions)</p>
          </div>
        </div>
      
        <div className='stats-main-box'>
          <TotalGraph transactions={modifedTransactions} />
        </div>
      </div>
      
      <div className='stats-main-row'>
        <div className='stats-main-box'>
          <div className='stats-category-radio'>
            <input type='radio' id='radio-category-income' name='type' onChange={() => setCatPieTypeIncome(true)} defaultChecked /><label htmlFor='radio-category-income'>Income</label>
            <input type='radio' id='radio-category-expense' name='type' onChange={() => setCatPieTypeIncome(false)} /><label htmlFor='radio-category-expense'>Expense</label>
          </div>
          { categoryPieTypeIncome ?
            <PieIncomeGraph transactions={modifedTransactions} /> 
          :
            <PieExpenseGraph transactions={modifedTransactions} />
          }
        </div>
      
        <div className='stats-main-box'>
          <LineGraph transactions={modifedTransactions} range={timeRange} />
        </div>
      </div>

      <div className='stats-main-row'>
        <div className='stats-main-box'>
          graph
        </div>
      
        <div className='stats-main-box'>
          graph
        </div>
      </div>
    </div>
  )
}

const netStyleLoss = { color: '#6d1e1e' };
const netStyleProfit = { color: '#1e6d58' };