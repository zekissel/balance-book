import { useMemo } from "react";
import { Expense, Income, isExpense } from "../../typedef";
import TotalGraph from "./TotalGraph";
import PieIncomeGraph from "./PieIncomeGraph";
import PieExpenseGraph from "./PieExpenseGraph";

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

  return (
    <div className='stats-main'>
      <div className='stats-main-row'>
        <div className='stats-main-box'>
          <h3>
            Net Balance: <span id='stats-main-net' style={netBalance > 0 ? netStyleProfit : netStyleLoss}>{ netBalance > 0 ? `+$${(netBalance / 100).toFixed(2)}` : `-$${(netBalance / -100).toFixed(2)}` }</span>
          </h3>
          <i>Since { minDate.toDateString() }</i>
          <div className='stats-main-info'>
            <p>Total expenses: -${ expenseTotal / 100 } ({ numExpenses })</p>
            <p>Total income: +${ incomeTotal / 100 } ({ numIncome })</p>
          </div>
        </div>
      
        <div className='stats-main-box'>
          <TotalGraph transactions={modifedTransactions} />
        </div>
      </div>
      
      <div className='stats-main-row'>
        <div className='stats-main-box'>
          <PieIncomeGraph transactions={modifedTransactions} />
        </div>
      
        <div className='stats-main-box'>
          <PieExpenseGraph transactions={modifedTransactions} />
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