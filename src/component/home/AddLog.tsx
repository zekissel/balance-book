import { useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import { UpdateLogProps, Category, IncomeCategory } from '../../typedef';

interface AddLogProps { toggle: () => void, updateLog: UpdateLogProps}
export default function AddLog ({ toggle, updateLog }: AddLogProps) {

  const [typeIncome, setTypeIncome] = useState(false);

  return (
    <fieldset className='add-log'>
      <legend>New Transaction</legend>

      <span>
        <input type='radio' name='type' value='Expense' id='exp' onChange={() => setTypeIncome(false)} defaultChecked/>
        <label htmlFor='exp'>Expense</label>
        
        <input type='radio' name='type' value='Income' id='inc' onChange={() => setTypeIncome(true)}/>
        <label htmlFor='inc'>Income</label>

        <button className='log-exit' onClick={toggle}>Cancel</button>
      </span>

      <AddTransaction 
        toggle={toggle} 
        updateLog={updateLog} 
        isIncome={typeIncome} 
      />
      
    </fieldset>
  );
}

interface TransactionProps { toggle: () => void, isIncome: boolean, updateLog: UpdateLogProps }
function AddTransaction ({ toggle, isIncome, updateLog }: TransactionProps) {

  const [store, setStore] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(Category.None);
  const [incomeCategory, setIncomeCategory] = useState(IncomeCategory.None);
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date());


  async function addExpense() {
    if (store === '' || amount === 0 || category === Category.None) return;

    await invoke("add_expense", { 
      'store': store,
      'amount': Math.round((amount + Number.EPSILON) * 100),
      'category': category,
      'desc': desc,
      'date': new Date(date.toDateString()),
    });

    updateLog.signalExp();
    toggle();
  }

  async function addIncome () {
    if (store === '' || amount === 0 || incomeCategory === IncomeCategory.None) return;

    await invoke("add_income", {
      'source': store,
      'amount': Math.round((amount + Number.EPSILON) * 100),
      'category': incomeCategory,
      'desc': desc,
      'date': new Date(date.toDateString()),
    });

    updateLog.signalInc();
    toggle();
  }


  return (
    <fieldset className='add-exp'>
      <legend>{ isIncome ? `Add Income` : `Add Expense` }</legend>

      <span className='exp-main'>
        <li>{ isIncome ? `Source`: `Store`}:<input type='text' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStore(e.target.value)}/></li>
        <li>Amount:<input type='number' step={.01} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(Number(e.target.value))}/></li>
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
          <input className='date-pick' type='date' onChange={(e) => {
            setDate(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')));
            }} />
        </li>
      </span>
      <li>Description:<textarea onChange={(e) => setDesc(e.target.value)}></textarea></li>
      

      <button className='exp-sub' onClick={isIncome ? addIncome : addExpense}>Submit</button>
    </fieldset>
  );
}

function getEnumKeys<
   T extends string,
   TEnumValue extends string | number,
>(enumVariable: { [key in T]: TEnumValue }) {
    return Object.keys(enumVariable) as Array<T>;
}