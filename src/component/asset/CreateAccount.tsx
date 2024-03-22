import { useState } from 'react';
import { AccountType, User } from '../../typedef';
import '../../styles/Log.css';
import { EditAccount } from './EditAccount';


interface CreateAccountProps { user: User, toggle: () => void, update: () => void }
export default function CreateAccount ({ user, toggle, update }: CreateAccountProps) {

  const [accountType, setAccountType] = useState(AccountType.Checking);

  return (
    <menu className='new-log'>

      <span className='new-log-radio'>
        <input type='radio' name='type' value='Expense' id='radio-set-checking' onChange={() => setAccountType(AccountType.Checking)} defaultChecked/>
        <label htmlFor='radio-set-checking'>Checking</label>
        
        <input type='radio' name='type' value='Expense' id='radio-set-savings' onChange={() => setAccountType(AccountType.Savings)} />
        <label htmlFor='radio-set-savings'>Savings</label>

        <input type='radio' name='type' value='Expense' id='radio-set-investing' onChange={() => setAccountType(AccountType.Investing)} />
        <label htmlFor='radio-set-investing'>Investing</label>
      </span>

      <EditAccount 
        log={null}
        user={user}
        type={accountType}
        toggle={toggle} 
        cancel={toggle}
        updateAccounts={update}
      />

    </menu>
  );
}
