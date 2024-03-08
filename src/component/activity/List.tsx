import { useMemo } from "react";
import { LogProps, Income, Expense } from "../../typedef";

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

  const transactions = useMemo(() => {
    let transactions: Array<Expense | Income> = [];
    transactions = transactions.concat(logs.income).concat(logs.expenses).sort((a, b) => a.date.getTime() - b.date.getTime());
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

  const otherTransactions = useMemo(() => {
    return transactions.filter(t => !pastMonthTransactions.includes(t) && !pastWeekTransactions.includes(t));
  }, [pastWeekTransactions, transactions]);

  const isExpense = (x: any): x is Expense => Object.keys(x).includes('store');

  return (
    <div>
      <h2>Past Week</h2>
      <ol>
        {pastWeekTransactions.map((expense, index) => (
          <li key={index} className={ isExpense(expense) ? 'exp-list-item' : 'inc-list-item'}>
            <span>{expense.date.toDateString()} { isExpense(expense) ? expense.store : expense.source }</span>
            <span> {isExpense(expense) ? `-$`: `+$`}{expense.amount / 100} </span>
            <span>{expense.category} - {expense.desc}</span>
          </li>
        ))}
      </ol>
      <h2>Past Month</h2>
      <ol>
        {pastMonthTransactions.map((expense, index) => (
          <li key={index} className={ isExpense(expense) ? 'exp-list-item' : 'inc-list-item'}>
            <span>{expense.date.toDateString()} { isExpense(expense) ? expense.store : expense.source }</span>
            <span> {isExpense(expense) ? `-$`: `+$`}{expense.amount / 100} </span>
            <span>{expense.category} - {expense.desc}</span>
          </li>
        ))}
      </ol>
      <h2>Previous</h2>
      <ol>
        {otherTransactions.map((expense, index) => (
          <li key={index} className={ isExpense(expense) ? 'exp-list-item' : 'inc-list-item'}>
            <span>{expense.date.toDateString()} { isExpense(expense) ? expense.store : expense.source }</span>
            <span> {isExpense(expense) ? `-$`: `+$`}{expense.amount / 100} </span>
            <span>{expense.category} - {expense.desc}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}