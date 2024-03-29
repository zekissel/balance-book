import { useState, useMemo } from 'react';
import AccountPage from '../asset/AccountPage';
import { Account, AccountType, Transaction, User } from '../../typedef';
import '../../styles/Page.css';
import '../../styles/Menu.css';
import CreateAccount from '../asset/CreateAccount';

interface AssetsProps { user: User, accounts: Account[], transactions: Transaction[], signalRefresh: () => void }
export default function Assets ({ user, accounts, transactions, signalRefresh }: AssetsProps) {

  const [curView, setCurView] = useState<AccountType>(matchView(localStorage.getItem('accView')));
  function matchView (view: string | null) {
    switch (view) {
      case '0': return AccountType.Checking;
      case '1': return AccountType.Savings;
      case '2': return AccountType.Investing;
      default: return AccountType.Checking;
    }
  }
  function matchAccounts (view: AccountType) {
    switch (view) {
      case AccountType.Checking: return checkingAccounts;
      case AccountType.Savings: return savingsAccounts;
      case AccountType.Investing: return investingAccounts;
    }
  }
  
  const checkingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Checking), [accounts]);
  const savingsAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Savings), [accounts]);
  const investingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Investing), [accounts]);


  const [showAddAccount, setShowAddAccount] = useState<AccountType | null>(null);

  return (
    <div className='page-root'>

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
          <button onClick={() => setShowAddAccount(AccountType.Checking)}><img src='/add-account.svg'/> Add Account</button>
        </div>
      </menu>

      <AccountPage user={user} accounts={matchAccounts(curView)} updateAccounts={signalRefresh} transactions={transactions} type={curView} addAccount={setShowAddAccount} />
      
      { showAddAccount &&
        <CreateAccount user={user} type={showAddAccount} toggle={() => setShowAddAccount(null)} update={signalRefresh} setAddAccount={setShowAddAccount}/>
      }
      
    </div>
  );
}