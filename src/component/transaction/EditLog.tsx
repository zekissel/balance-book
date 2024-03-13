import { invoke } from "@tauri-apps/api/tauri";
import React, { useState } from "react";
import { Category, Expense, Income, IncomeCategory, isExpense, UpdateLogProps, getEnumKeys } from "../../typedef";


interface EditLogProps { log: Expense | Income | null, toggle: () => void, cancel: () => void, isIncome: boolean, updateLog: UpdateLogProps }
export function EditLog ({ log, toggle, cancel, isIncome, updateLog }: EditLogProps) {

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
    <fieldset className={isIncome ? 'new-trans new-trans-income' : 'new-trans new-trans-expense'}>
      <legend>{ log ? 'Edit' : 'New' }{ isIncome ? ` Income` : ` Expense` }</legend>

      <div className='new-trans-main'>
        <li><label>{ isIncome ? `Source`: `Store`}: </label><input type='text' value={store} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStore(e.target.value)}/></li>
        <li><label>Amount: </label><input type='text' value={amount} onChange={updateAmount}/></li>
      </div>
      
      <span className='new-trans-detail'>
        <li><label>Category: </label>
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
        <li><label>Date: </label>
          <input className='date-pick' type='date' value={date.toISOString().substring(0, 10)} onChange={(e) => {
            setDate(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')));
            }} />
        </li>
      </span>
      <li className='new-trans-desc'><label>Desc: </label><textarea value={desc} onChange={(e) => setDesc(e.target.value)}></textarea></li>
      
      <li className='new-trans-meta'>
        <button className='new-trans-submit' onClick={isIncome ? addIncome : addExpense}>Submit</button>
        <button onClick={cancel}>Cancel</button>
        { log && <button className='delete-trans' onClick={deleteTransaction}>Delete</button> }
      </li>
      
      
    </fieldset>
  );
}