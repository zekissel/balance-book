import { useMemo, useState } from "react";
import { LogProps, Income, Expense, isExpense, getCategoryColor, addDays } from "../../typedef";
import Transaction from "../home/Transaction";

interface ListProps { logs: LogProps }
export default function List ({ logs }: ListProps) {


  function thisYear(date: Date) {
    return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
  }

  const pastWeekTransactions = useMemo(() => {
    const weekAgo = addDays(new Date(), -7);
    return logs.filter(t => t.date.getTime() >= weekAgo.getTime());
  }, [logs]);

  const pastMonthTransactions = useMemo(() => {
    const monthAgo = addDays(new Date(), -30);
    return logs.filter(t => (t.date.getTime() >= monthAgo.getTime()) && !pastWeekTransactions.includes(t));
  }, [logs]);

  const pastYearTransactions = useMemo(() => {
    const yearAgo = thisYear(new Date());
    return logs.filter(t => (t.date.getTime() >= yearAgo.getTime()) && !pastMonthTransactions.includes(t) && !pastWeekTransactions.includes(t));
  }, [logs]);

  const otherTransactions = useMemo(() => {
    return logs.filter(t => !pastMonthTransactions.includes(t) && !pastWeekTransactions.includes(t) && !pastYearTransactions.includes(t));
  }, [pastWeekTransactions, logs]);


  const allTransactions = useMemo(() => [
    pastWeekTransactions, pastMonthTransactions, pastYearTransactions, otherTransactions
  ], [pastWeekTransactions, pastMonthTransactions, pastYearTransactions, otherTransactions]);

  const transactionTitles = ['This Week', 'This Month', 'This Year', 'Previous'];
  const [selectedTransactions, setSelectedTransactions] = useState<(Expense | Income)[]>([]);

  return (
    <div id='list-element'>

      {
        allTransactions.map((transactionCollection, ind) => (
          
          <ol key={ind}>
            <h2>{ transactionTitles[ind] }</h2>
            {transactionCollection.map((transaction, index) => (
              <li key={index} className={ isExpense(transaction) ? 'exp-list-item' : 'inc-list-item'} onClick={() => setSelectedTransactions([...selectedTransactions, transaction])}>
                <span className='list-date'>{transaction.date.toDateString().split(' ').slice(0, 3).join(' ')}</span>
                <span> { isExpense(transaction) ? transaction.store : transaction.source }</span>
                <span className='list-amount'> {isExpense(transaction) ? `-$`: `+$`}{transaction.amount / 100} </span>
                <span className='list-cat' style={{ backgroundColor: getCategoryColor(transaction.category) }}>{transaction.category}</span><span> - {transaction.desc}</span>
              </li>
            ))}
          </ol>
        ))
      }

      { selectedTransactions.length > 0 && 
        selectedTransactions.map((trans, index) => (
          <Transaction 
            key={index} 
            transaction={trans} 
            toggle={() => setSelectedTransactions(selectedTransactions.filter(t => JSON.stringify(t) !== JSON.stringify(trans)))}
          />
        ))
      } 

    </div>
  )
}