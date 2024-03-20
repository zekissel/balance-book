import { useMemo, useState, useEffect } from "react";
import { LogProps, Income, Expense, isExpense, UpdateLogProps, Account } from "../../typedef";
import { getCategoryColor, addDays, getAccounts } from "../../typeassist";
import ViewLog from "../transaction/ViewLog";
import '../../styles/List.css';

interface ListProps { logs: LogProps, updateLog: UpdateLogProps, showFilter: boolean }
export default function List ({ logs, updateLog, showFilter }: ListProps) {

  const [accounts, setAccounts] = useState<Account[]>([]);
  const refreshAccounts = async () => { setAccounts(await getAccounts()) };
  useEffect(() => { refreshAccounts() }, []);


  const pastWeekTransactions = useMemo(() => {
    const weekAgo = addDays(new Date(), -7);
    return logs.filter(t => t.date.getTime() >= weekAgo.getTime());
  }, [logs]);

  const pastMonthTransactions = useMemo(() => {
    const monthAgo = addDays(new Date(), -30);
    return logs.filter(t => (t.date.getTime() >= monthAgo.getTime()) && !pastWeekTransactions.includes(t));
  }, [logs]);

  const past90DTransactions = useMemo(() => {
    const yearAgo = addDays(new Date(), -90);
    return logs.filter(t => (t.date.getTime() >= yearAgo.getTime()) && !pastMonthTransactions.includes(t) && !pastWeekTransactions.includes(t));
  }, [logs]);

  const otherTransactions = useMemo(() => {
    return logs.filter(t => !pastMonthTransactions.includes(t) && !pastWeekTransactions.includes(t) && !past90DTransactions.includes(t));
  }, [pastWeekTransactions, logs]);


  const allTransactions = useMemo(() => [
    pastWeekTransactions, pastMonthTransactions, past90DTransactions, otherTransactions
  ], [pastWeekTransactions, pastMonthTransactions, past90DTransactions, otherTransactions]);

  const transactionTitles = ['7 Days', '30 Days', '90 Days', 'Previous'];
  const [selectedTransactions, setSelectedTransactions] = useState<(Expense | Income)[]>([]);
  const updateSelected = (transaction: Expense | Income) => {
    if (selectedTransactions.includes(transaction)) setSelectedTransactions(selectedTransactions.filter(t => JSON.stringify(t) !== JSON.stringify(transaction)));
    else setSelectedTransactions([...selectedTransactions, transaction]);
  };

  return (
    <div className={showFilter ? 'main-down-shift page-main' : 'page-main'}>

      {
        allTransactions.map((transactionCollection, ind) => (
          
          <ol className='list-main' key={ind}>
            <h2>{ transactionTitles[ind] }</h2>
            {transactionCollection.map((transaction, index) => (
              <li key={index} className={ (isExpense(transaction) ? 'list-item-expense' : 'list-item-income') + ' list-item'} onClick={() => updateSelected(transaction)}>
                <span className='list-item-date'>{transaction.date.toDateString().split(' ').slice(0, 3).join(' ')}</span>
                <span className='list-item-source'> { isExpense(transaction) ? transaction.store : transaction.source }</span>
                <span className='list-item-amount'> {isExpense(transaction) ? `-$`: `+$`}{transaction.amount / 100} </span>
                <span className='list-item-account'>{ `${accounts.find(a => a.id === transaction.account_id)?.account_type.slice(0,5)}:${accounts.find(a => a.id === transaction.account_id)?.account_name}` }</span>
                <span className='list-item-category' style={{ backgroundColor: getCategoryColor(transaction.category) }}>{transaction.category}</span>
                <span className='list-item-desc'> - {transaction.desc}</span>
              </li>
            ))}
          </ol>
        ))
      }

      { selectedTransactions.length > 0 && 
        selectedTransactions.map((trans, index) => (
          <ViewLog 
            key={index} 
            transaction={trans} 
            toggle={() => setSelectedTransactions(selectedTransactions.filter(t => JSON.stringify(t) !== JSON.stringify(trans)))}
            updateLog={updateLog}
          />
        ))
      } 

    </div>
  )
}