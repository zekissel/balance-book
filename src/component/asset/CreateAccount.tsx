import { AccountType, User } from '../../typedef';
import '../../styles/Log.css';
import { EditAccount } from './EditAccount';


interface CreateAccountProps { user: User, type: AccountType, toggle: () => void, update: () => void, setAddAccount: React.Dispatch<React.SetStateAction<AccountType | null>> }
export default function CreateAccount ({ user, type, toggle, update, setAddAccount }: CreateAccountProps) {

  return (
    <menu className='new-log'>

      <span className='new-log-radio'>
        <input type='radio' name='type' value='Expense' id='radio-set-checking' onChange={() => setAddAccount(AccountType.Checking)} defaultChecked={type===AccountType.Checking} />
        <label htmlFor='radio-set-checking'>Checking</label>
        
        <input type='radio' name='type' value='Expense' id='radio-set-savings' onChange={() => setAddAccount(AccountType.Savings)} defaultChecked={type===AccountType.Savings}/>
        <label htmlFor='radio-set-savings'>Savings</label>

        <input type='radio' name='type' value='Expense' id='radio-set-investing' onChange={() => setAddAccount(AccountType.Investing)} defaultChecked={type===AccountType.Investing}/>
        <label htmlFor='radio-set-investing'>Investing</label>
      </span>

      <EditAccount 
        log={null}
        user={user}
        type={type}
        toggle={toggle} 
        cancel={toggle}
        updateAccounts={update}
      />

    </menu>
  );
}
