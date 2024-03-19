import { Expense, Income, UpdateLogProps, isExpense } from "../../typedef";
import { getCategoryColor } from "../../typeassist";
import Draggable from "react-draggable";
import { useState } from "react";
import { EditLog } from "./EditLog";
import '../../styles/Log.css';

interface ViewLogProps { transaction: Expense | Income, toggle: () => void, updateLog: UpdateLogProps}
export default function ViewLog ({ transaction, toggle, updateLog }: ViewLogProps) {

  const [editsActive, setEditsActive] = useState(false);
  const toggleEdits = () => setEditsActive(!editsActive);


  return (
      <Draggable handle=".handle">
        <div className='view-log'>
          

          <li className='view-log-meta'>
            <button onClick={toggleEdits}><img src='/edit.svg' /></button>
            <div className='handle'><img draggable={false} src='/move-arrow.svg' /></div>
            <button className='spot-exit' onClick={toggle}><img src="x.svg" /></button>
          </li>

          { editsActive ? 
            <EditLog log={transaction} toggle={toggle} cancel={toggleEdits} updateLog={updateLog} isIncome={!isExpense(transaction)} />
          :
            <fieldset className='view-log-static'>
              <legend>{ transaction.date.toDateString().split(' ').slice(1).join(' ') }</legend>
              <li className='view-log-main'>
                <span className={isExpense(transaction) ? 'view-log-expense' : 'view-log-income'}>{ isExpense(transaction) ? `- ` : `+ ` }{ `$${transaction.amount / 100}` }</span>
                <span className='view-log-source'>{ isExpense(transaction) ? transaction.store : transaction.source }</span>
              </li>
              <li className='view-log-category'>
                <span style={{ backgroundColor: getCategoryColor(transaction.category) }}>{ transaction.category }</span>
              </li>
              
              <li className='view-log-desc'>{ transaction.desc }</li>
            </fieldset>
          }
          

        </div>
      </Draggable>
  )
}