import Draggable from "react-draggable";
import { Day, isExpense } from "../../typedef";

interface ViewDayProps { day: Day, toggle: () => void}
export default function ViewDay ({ day, toggle }: ViewDayProps) {

  return (
    <Draggable>
      <div id='viewday-container'>
        
        <h3>{day.date.toDateString()}</h3>
    
        <ul>
          { day.transactions.map((t, i) => 
            <li key={i}>
              <span className='spot-source'>{isExpense(t) ? t.store : t.source}</span>
              <span className='list-amount'>{isExpense(t) ? `-$` : `+$`}{t.amount / 100}</span>
              <span>{t.desc}</span>
            </li>
          )}

          { day.transactions.length === 0 && <li>No transactions</li>}
        </ul>

        <button onClick={toggle}>X</button>

      </div>
    </Draggable>
  )
}