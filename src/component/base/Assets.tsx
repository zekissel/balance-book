import { useState, useMemo } from 'react';
import { Account, AccountType, Transaction, User } from '../../typedef';
import AccountPage from '../asset/AccountPage';
import CreateAccount from '../asset/CreateAccount';
import '../../styles/Page.css';
import '../../styles/Menu.css';


interface AssetsProps { user: User, accounts: Account[], transactions: Transaction[], signalRefresh: () => void }
export default function Assets ({ user, accounts, transactions, signalRefresh }: AssetsProps) {

  const [curView, setCurView] = useState<AccountType>(matchView(localStorage.getItem('accView')));
  function matchView (view: string | null) {
    switch (view) {
      case '0': return AccountType.Checking;
      case '1': return AccountType.Credit;
      case '2': return AccountType.Savings;
      case '3': return AccountType.Investment;
      case '4': return AccountType.Loan;
      default: return AccountType.Checking;
    }
  }
  function matchAccounts (view: AccountType) {
    switch (view) {
      case AccountType.Checking: return checkingAccounts;
      case AccountType.Savings: return savingsAccounts;
      case AccountType.Investment: return investingAccounts;
      case AccountType.Credit: return creditAccounts;
      case AccountType.Loan: return loanAccounts;
    }
  }
  
  const loanAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Loan), [accounts]);
  const creditAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Credit), [accounts]);
  const savingsAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Savings), [accounts]);
  const investingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Investment), [accounts]);
  //const checkingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Checking), [accounts]);
  const checkingAccounts = accounts.filter(a => !savingsAccounts.includes(a) && !investingAccounts.includes(a) && !loanAccounts.includes(a) && !creditAccounts.includes(a));

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
            id={ curView === AccountType.Credit ? 'dynamic-menu-current' : undefined} 
            onClick={() => {setCurView(AccountType.Credit); localStorage.setItem('accView', '1')}}><img src='/credit.svg'/>Credit
          </button>
          <button 
            id={ curView === AccountType.Savings ? 'dynamic-menu-current' : undefined} 
            onClick={() => {setCurView(AccountType.Savings); localStorage.setItem('accView', '2')}}><img src='/bank.svg'/>Savings
          </button>
          <button 
            id={ curView === AccountType.Investment ? 'dynamic-menu-current' : undefined} 
            onClick={() => {setCurView(AccountType.Investment); localStorage.setItem('accView', '3')}}><img src='/trend.svg'/>Investment
          </button>
          <button 
            id={ curView === AccountType.Loan ? 'dynamic-menu-current' : undefined} 
            onClick={() => {setCurView(AccountType.Loan); localStorage.setItem('accView', '4')}}><img src='/loan.svg'/>Loan
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