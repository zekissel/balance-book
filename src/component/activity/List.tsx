import { useMemo, useState } from "react";
import { LogProps, Income, Expense, isExpense, getCategoryColor } from "../../typedef";
import Transaction from "../home/Transaction";

interface ListProps { logs: LogProps }
export default function List ({ logs }: ListProps) {

  function addDays(date: Date, days: number) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + days,
      0, 0, 0, 0
    );
  }

  function thisYear(date: Date) {
    return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
  }

  const transactions = useMemo(() => {
    let transactions: Array<Expense | Income> = [];
    transactions = transactions.concat(logs.income).concat(logs.expenses).sort((a, b) => b.date.getTime() - a.date.getTime());
    return transactions;
  }, [logs]);

  const pastWeekTransactions = useMemo(() => {
    const weekAgo = addDays(new Date(), -7);
    return transactions.filter(t => t.date.getTime() >= weekAgo.getTime());
  }, [transactions]);

  const pastMonthTransactions = useMemo(() => {
    const monthAgo = addDays(new Date(), -30);
    return transactions.filter(t => (t.date.getTime() >= monthAgo.getTime()) && !pastWeekTransactions.includes(t));
  }, [transactions]);

  const pastYearTransactions = useMemo(() => {
    const yearAgo = thisYear(new Date());
    return transactions.filter(t => (t.date.getTime() >= yearAgo.getTime()) && !pastMonthTransactions.includes(t) && !pastWeekTransactions.includes(t));
  }, [transactions]);

  const otherTransactions = useMemo(() => {
    return transactions.filter(t => !pastMonthTransactions.includes(t) && !pastWeekTransactions.includes(t) && !pastYearTransactions.includes(t));
  }, [pastWeekTransactions, transactions]);


  const allTransactions = useMemo(() => [
    pastWeekTransactions,
    pastMonthTransactions,
    pastYearTransactions,
    otherTransactions
  ], [pastWeekTransactions, pastMonthTransactions, pastYearTransactions, otherTransactions]);
  const transactionTitles = ['This Week', 'This Month', 'This Year', 'Previous'];


  const [selectedTransaction, setSelectedTransaction] = useState<Expense | Income | null>(null);

  return (
    <div id='list-element'>

      {
        allTransactions.map((transactionCollection, ind) => (
          
          <ol key={ind}>
            <h2>{ transactionTitles[ind] }</h2>
            {transactionCollection.map((transaction, index) => (
              <li key={index} className={ isExpense(transaction) ? 'exp-list-item' : 'inc-list-item'} onClick={() => setSelectedTransaction(transaction)}>
                <span className='list-date'>{transaction.date.toDateString().split(' ').slice(0, 3).join(' ')}</span>
                <span> { isExpense(transaction) ? transaction.store : transaction.source }</span>
                <span className='list-amount'> {isExpense(transaction) ? `-$`: `+$`}{transaction.amount / 100} </span>
                <span className='list-cat' style={{ backgroundColor: getCategoryColor(transaction.category) }}>{transaction.category}</span><span> - {transaction.desc}</span>
              </li>
            ))}
          </ol>
        ))
      }

      { selectedTransaction && <Transaction transaction={selectedTransaction} toggle={() => setSelectedTransaction(null)} /> }

    </div>
  )
}