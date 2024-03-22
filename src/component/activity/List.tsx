import { useMemo, useState } from "react";
import { Transaction, Account } from "../../typedef";
import { getCategoryColor, addDays } from "../../typeassist";
import ViewLog from "../transaction/ViewLog";
import '../../styles/List.css';

interface ListProps { logs: Transaction[], accounts: Account[], updateLog: () => void, showFilter: boolean }
export default function List ({ logs, accounts, updateLog, showFilter }: ListProps) {

  const futureTransactions = useMemo(() => {
    return logs.filter(t => t.date.getTime() > new Date().getTime());
  }, [logs]);

  const pastWeekTransactions = useMemo(() => {
    const weekAgo = addDays(new Date(), -6);
    return logs.filter(t => t.date.getTime() >= weekAgo.getTime() && !futureTransactions.includes(t));
  }, [logs, futureTransactions]);

  const pastMonthTransactions = useMemo(() => {
    const monthAgo = addDays(new Date(), -29);
    return logs.filter(t => (t.date.getTime() >= monthAgo.getTime()) && !futureTransactions.includes(t) && !pastWeekTransactions.includes(t));
  }, [logs, futureTransactions, pastWeekTransactions]);

  const past90DTransactions = useMemo(() => {
    const yearAgo = addDays(new Date(), -89);
    return logs.filter(t => (t.date.getTime() >= yearAgo.getTime()) && !futureTransactions.includes(t) && !pastMonthTransactions.includes(t) && !pastWeekTransactions.includes(t));
  }, [logs, futureTransactions, pastWeekTransactions, pastMonthTransactions]);

  const otherTransactions = useMemo(() => {
    return logs.filter(t => !pastMonthTransactions.includes(t) && !futureTransactions.includes(t) && !pastWeekTransactions.includes(t) && !past90DTransactions.includes(t));
  }, [logs, futureTransactions, pastWeekTransactions, pastMonthTransactions, past90DTransactions]);


  const allTransactions = useMemo(() => [
    futureTransactions, pastWeekTransactions, pastMonthTransactions, past90DTransactions, otherTransactions
  ], [futureTransactions, pastWeekTransactions, pastMonthTransactions, past90DTransactions, otherTransactions]);

  const transactionTitles = ['Upcoming', '7 Days', '30 Days', '90 Days', 'Previous'];
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const updateSelected = (transaction: Transaction) => {
    if (selectedTransactions.includes(transaction)) setSelectedTransactions(selectedTransactions.filter(t => JSON.stringify(t) !== JSON.stringify(transaction)));
    else setSelectedTransactions([...selectedTransactions, transaction]);
  };

  const [showIndices, setShowIndices] = useState(sessionStorage.getItem('list.indices')?.split(' ').map(i => Number(i)) ?? [0, 1, 2, 3, 4]);
  const handleIndexToggle = (index: number) => {
    if (showIndices.includes(index)) {
      const indices = showIndices.filter(i => i !== index);
      setShowIndices(indices);
      sessionStorage.setItem('list.indices', indices.join(' '));
    }
    else {
      const indices = [...showIndices, index];
      setShowIndices(indices);
      sessionStorage.setItem('list.indices', indices.join(' '));
    }
  }

  return (
    <div className={showFilter ? 'main-down-shift page-main' : 'page-main'}>

      {
        allTransactions.map((transactionCollection, ind) => (
          
          <ol className='list-main' key={ind}>
            <h2 onClick={() => handleIndexToggle(ind)}>{ transactionTitles[ind] }<img src={ showIndices.includes(ind) ? '/double-down.svg' : 'double-left.svg'}/></h2>
            { showIndices.includes(ind) && transactionCollection.map((transaction, index) => (
              <li key={index} className={ (transaction.amount < 0 ? 'list-item-expense' : 'list-item-income') + ' list-item'} onClick={() => updateSelected(transaction)}>
                <span className='list-item-date'>{transaction.date.toDateString().split(' ').slice(0, 3).join(' ')}</span>
                <span className='list-item-source'> { transaction.company }</span>
                <span className='list-item-amount'> { transaction.amount < 0 ? `-$`: `+$`}{Math.abs(transaction.amount / 100).toFixed(2)} </span>
                <span className='list-item-category' style={{ backgroundColor: getCategoryColor(transaction.category) }}>{transaction.category}</span>
                <span className='list-item-desc'> - {transaction.desc}</span>
                <span className='list-item-account'>{ `${accounts.find(a => a.id === transaction.account_id)?.account_type.slice(0,5)}:${accounts.find(a => a.id === transaction.account_id)?.account_name}` }</span>
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