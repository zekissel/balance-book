import { useMemo } from "react";
import { LogProps, Income, Expense } from "../../typedef";

interface ListProps { logs: LogProps }
export default function List ({ logs }: ListProps) {

  const transactions = useMemo(() => {
    let transactions: Array<Expense | Income> = [];
    transactions = transactions.concat(logs.income).concat(logs.expenses).sort((a, b) => a.date.getTime() - b.date.getTime());
    console.log(transactions);
    return transactions;
  }, [logs]);

  const isExpense = (x: any): x is Expense => Object.keys(x).includes('store');

  return (
    <div>
      <ol>
        {transactions.map((expense, index) => (
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