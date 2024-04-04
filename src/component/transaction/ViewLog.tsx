import { Transaction, Account } from "../../typedef";
import { getCategoryColor } from "../../typeassist";
import Draggable from "react-draggable";
import { useState } from "react";
import { EditLog } from "./EditLog";
import '../../styles/Log.css';

interface ViewLogProps { transaction: Transaction, accounts: Account[], toggle: () => void, updateLog: () => void }
export default function ViewLog ({ transaction, accounts, toggle, updateLog }: ViewLogProps) {

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
            <EditLog log={transaction} accounts={accounts} toggle={toggle} cancel={toggleEdits} updateLog={updateLog} isIncome={transaction.amount > 0} />
          :
            <fieldset className='view-log-static'>
              <legend>{ transaction.date.toDateString().split(' ').slice(1).join(' ') }</legend>
              <li className='view-log-main'>
                <span className={transaction.amount < 0 ? 'view-log-expense' : 'view-log-income'}>{ transaction.amount < 0 ? `- ` : `+ ` }{ `$${Math.abs(transaction.amount / 100)}` }</span>
                <span className='view-log-source'>{ transaction.company }</span>
              </li>
              <li className='view-log-category'>
                <span style={{ backgroundColor: getCategoryColor(transaction.category) }}>{ `${transaction.category}` }</span>
              </li>
              
              <li className='view-log-desc'>{ transaction.desc }</li>
            </fieldset>
          }
          

        </div>
      </Draggable>
  )
}