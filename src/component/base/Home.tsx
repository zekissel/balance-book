import '../../styles/Page.css';
import '../../styles/Menu.css';
import Logo from './Logo';
import { User, Account, Transaction } from '../../typedef';
import Preview from './Preview';

interface HomeProps { user: User, accounts: Account[], transactions: Transaction[] }
export default function Home ({ user, accounts, transactions }: HomeProps) {

  return (
    <div className='page-root'>
      <menu className='dynamic-menu'>
        <div className='dynamic-menu-main'>
          <button>{ new Date().toDateString() }</button>
          <button>Welcome, { user.fname !== null ? user.fname : user.uname }!</button>
        </div>

        <div className='dynamic-menu-main'>
          <button><img src='/log.svg' /> Add Log</button>
          <button><img src='/add-account.svg'/> Add Account</button>
        </div>
      </menu>

      <div className='page-main'>
        <Logo />

        <div>
          <Preview accounts={accounts} transactions={transactions}/>
        </div>

        <div>
          financial news/goals
        </div>
      </div>
    </div>
  );
}