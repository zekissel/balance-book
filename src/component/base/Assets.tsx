import { useState, useEffect, useMemo } from 'react';
import AccountPage from '../asset/AccountPage';
import { Account, AccountType, getAccounts } from '../../typedef';
import '../../styles/Assets.css';
import '../../styles/Menu.css';
import CreateAccount from '../asset/CreateAccount';

export default function Assets () {

  const matchView = (view: number) => {
    switch (view) {
      case 0: return AccountType.Checking;
      case 1: return AccountType.Savings;
      case 2: return AccountType.Investing;
    }
  }
  const [curView, setCurView] = useState<AccountType>(matchView(Number(localStorage.getItem('accView'))) ?? AccountType.Checking);
  
  
  const [signalAccountUpdate, setSignalAccountUpdate] = useState(false);
  const signalUpdate = () => setSignalAccountUpdate(!signalAccountUpdate);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const refreshAccounts = async () => { setAccounts(await getAccounts()) };

  useEffect(() => { refreshAccounts() }, [signalAccountUpdate]);

  const checkingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Checking), [accounts]);
  const savingsAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Savings), [accounts]);
  const investingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Investing), [accounts]);


  const [showAddAccount, setShowAddAccount] = useState(false);
  const toggleAddAccount = () => setShowAddAccount(!showAddAccount);

  return (
    <div id='assets-root'>

      <menu className='dynamic-menu'>
        <div className='dynamic-menu-main'>
          <button 
            id={ curView === AccountType.Checking ? 'dynamic-menu-current' : undefined} 
            onClick={() => {setCurView(AccountType.Checking); localStorage.setItem('accView', '0')}}><img src='/card.svg'/>Checking
          </button>
          <button 
            id={ curView === AccountType.Savings ? 'dynamic-menu-current' : undefined} 
            onClick={() => {setCurView(AccountType.Savings); localStorage.setItem('accView', '1')}}><img src='/bank.svg'/>Savings
          </button>
          <button 
            id={ curView === AccountType.Investing ? 'dynamic-menu-current' : undefined} 
            onClick={() => {setCurView(AccountType.Investing); localStorage.setItem('accView', '2')}}><img src='/trend.svg'/>Investing
          </button>
        </div>

        <div className='dynamic-menu-main'>
          <button onClick={toggleAddAccount}><img src='/add-account.svg'/>Add Account</button>
        </div>
      </menu>

      { curView === AccountType.Checking &&
        <AccountPage accounts={checkingAccounts} updateAccounts={refreshAccounts} />
      }

      { curView === AccountType.Savings &&
        <AccountPage accounts={savingsAccounts} updateAccounts={refreshAccounts} />
      }

      { curView === AccountType.Investing &&
        <AccountPage accounts={investingAccounts} updateAccounts={refreshAccounts} />
      }

      { showAddAccount &&
        <CreateAccount toggle={toggleAddAccount} update={signalUpdate} />
      }
      
    </div>
  );
}