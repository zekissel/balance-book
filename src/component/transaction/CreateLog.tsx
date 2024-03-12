import { useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import { UpdateLogProps, Category, IncomeCategory, getEnumKeys, Expense, Income, isExpense } from '../../typedef';
import Draggable from 'react-draggable';

interface CreateLogProps { toggle: () => void, updateLog: UpdateLogProps}
export default function CreateLog ({ toggle, updateLog }: CreateLogProps) {

  const [addIncome, setAddIncome] = useState(false);

  return (
    <Draggable handle='.handle'>
    <fieldset className='add-log'>
      <legend>Add Log</legend>
      <div className='handle'><img draggable={false} src='/move-arrow.svg' /></div>

      <span>
        <input type='radio' name='type' value='Expense' id='exp' onChange={() => setAddIncome(false)} defaultChecked/>
        <label htmlFor='exp'>Expense</label>
        
        <input type='radio' name='type' value='Income' id='inc' onChange={() => setAddIncome(true)}/>
        <label htmlFor='inc'>Income</label>
      </span>

      <EditTransaction 
        log={null}
        toggle={toggle} 
        cancel={toggle}
        updateLog={updateLog} 
        isIncome={addIncome}
      />

    </fieldset>
    </Draggable>
  );
}

interface TransactionProps { log: Expense | Income | null, toggle: () => void, cancel: () => void, isIncome: boolean, updateLog: UpdateLogProps }
export function EditTransaction ({ log, toggle, cancel, isIncome, updateLog }: TransactionProps) {

  const [store, setStore] = useState(log ? (isExpense(log) ? log.store : log.source) : '');
  const [amount, setAmount] = useState(log ? String(log.amount / 100) : '0');
  const [category, setCategory] = useState(log && isExpense(log) ? log.category : Category.None);
  const [incomeCategory, setIncomeCategory] = useState(log && !isExpense(log) ? log.category : IncomeCategory.None);
  const [desc, setDesc] = useState(log ? log.desc : '');
  const [date, setDate] = useState(log ? log.date : new Date());


  async function addExpense() {
    if (store === '' || amount === '0' || category === Category.None) return;

    const data = {
      'id': log ? log.id : 0,
      'store': store,
      'amount': Math.round((Number(amount) + Number.EPSILON) * 100),
      'category': category,
      'desc': desc,
      'date': new Date(date.toDateString()),
    };

    if (log) await invoke("update_expense", data);
    else await invoke("add_expense", data);

    updateLog.signalExp();
    toggle();
  }

  async function addIncome () {
    if (store === '' || amount === '0' || incomeCategory === IncomeCategory.None) return;

    const data = {
      'id': log ? log.id : 0,
      'source': store,
      'amount': Math.round((Number(amount) + Number.EPSILON) * 100),
      'category': incomeCategory,
      'desc': desc,
      'date': new Date(date.toDateString()),
    };

    if (log) await invoke("update_income", data);
    else await invoke("add_income", data);
    
    updateLog.signalInc();
    toggle();
  }

  const deleteTransaction = () => {
    if (log && isIncome) {
      invoke("delete_income", { 'id': log.id });
      updateLog.signalInc();
    }
    else if (log && !isIncome) {
      invoke("delete_expense", { 'id': log.id });
      updateLog.signalExp();
    }
    toggle();
  }

  const updateAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
    if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmount(am);
    }
  }

  return (
    <fieldset className='add-exp'>
      <legend>{ log ? 'Edit' : 'New' }{ isIncome ? ` Income` : ` Expense` }</legend>

      <span className='exp-main'>
        <li>{ isIncome ? `Source`: `Store`}:<input type='text' value={store} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStore(e.target.value)}/></li>
        <li>Amount:<input type='text' value={amount} onChange={updateAmount}/></li>
      </span>
      
      <span className='exp-detail'>
        <li>Category:
        { isIncome ?
          <select value={incomeCategory} onChange={(e) => setIncomeCategory(IncomeCategory[e.target.value as keyof typeof IncomeCategory])}>
            {getEnumKeys(IncomeCategory).map((key, index) => (
              <option key={index} value={IncomeCategory[key]}>
                {IncomeCategory[key]}
              </option>
            ))}
          </select>
          :
          <select value={category} onChange={(e) => setCategory(Category[e.target.value as keyof typeof Category])}>
            {getEnumKeys(Category).map((key, index) => (
              <option key={index} value={Category[key]}>
                {Category[key]}
              </option>
            ))}
          </select>
        }
        </li>
        <li>Date:
          <input className='date-pick' type='date' value={date.toISOString().substring(0, 10)} onChange={(e) => {
            setDate(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')));
            }} />
        </li>
      </span>
      <li>Description:<textarea value={desc} onChange={(e) => setDesc(e.target.value)}></textarea></li>
      

      <button className='exp-sub' onClick={isIncome ? addIncome : addExpense}>Submit</button>
      <button onClick={cancel}>Cancel</button>
      { log && <button className='delete-trans' onClick={deleteTransaction}>Delete</button> }
    </fieldset>
  );
}

