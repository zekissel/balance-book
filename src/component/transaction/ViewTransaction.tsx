import { Expense, Income, UpdateLogProps, getCategoryColor, isExpense } from "../../typedef";
import Draggable from "react-draggable";
import { useState } from "react";
import { EditTransaction } from "./CreateLog";

interface TransactionProps { transaction: Expense | Income, toggle: () => void, updateLog: UpdateLogProps}
export default function Transaction ({ transaction, toggle, updateLog }: TransactionProps) {

  const [editsActive, setEditsActive] = useState(false);
  const toggleEdits = () => setEditsActive(!editsActive);


  return (
      <Draggable>
      <div className='view-trans'>
        

        <li className='spot-date'>
          { transaction.date.toDateString().split(' ').slice(1).join(' ') }
          <div className='handle'><img draggable={false} src='/move-arrow.svg' /></div>
          <button onClick={toggleEdits}><img src='/cog.svg' /></button>
          <button className='spot-exit' onClick={toggle}><img src="x.svg" /></button>
        </li>

        { editsActive ? 
          <EditTransaction log={transaction} toggle={toggle} cancel={toggleEdits} updateLog={updateLog} isIncome={!isExpense(transaction)} />
        :
          <>
            <li>
              <span className={isExpense(transaction) ? 'spot-tag-exp' : 'spot-tag-inc'}>{ isExpense(transaction) ? `- ` : `+ ` }{ `$${transaction.amount / 100}` }</span>
            </li>
            <li>
              <span className='spot-source'>{ isExpense(transaction) ? transaction.store : transaction.source }</span>
              <span className='spot-cat' style={{ backgroundColor: getCategoryColor(transaction.category) }}>{ transaction.category }</span>
            </li>
            
            <li>{ transaction.desc }</li>
          </>
        }
        

      </div>
      </Draggable>
  )
}