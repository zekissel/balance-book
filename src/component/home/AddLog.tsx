import { useState } from 'react';
import AddTransaction from './AddTransaction';
import { UpdateLogProps } from '../../typedef';

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

      <AddTransaction toggle={toggle} updateLog={updateLog} income={typeIncome} />

      
    </fieldset>
  );
}