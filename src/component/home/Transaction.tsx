import { Expense, Income, getCategoryColor, isExpense } from "../../typedef";
import Draggable from "react-draggable";

interface TransactionProps { transaction: Expense | Income, toggle: () => void}
export default function Transaction ({ transaction, toggle }: TransactionProps) {


  return (
    <Draggable>
      <div className='view-trans'>
        

        <li className='spot-date'>
          { transaction.date.toDateString() }
          <button className='spot-exit' onClick={toggle}>X</button>
        </li>
        <li>
          <span className={isExpense(transaction) ? 'spot-tag-exp' : 'spot-tag-inc'}>{ isExpense(transaction) ? `- ` : `+ ` }{ `$${transaction.amount / 100}` }</span>
        </li>
        <li>
          <span className='spot-source'>{ isExpense(transaction) ? transaction.store : transaction.source }</span>
          <span className='spot-cat' style={{ backgroundColor: getCategoryColor(transaction.category) }}>{ transaction.category }</span>
        </li>
        
        <li>{ transaction.desc }</li>

      </div>
    </Draggable>
  )
}