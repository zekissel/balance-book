import '../../styles/Page.css';
import '../../styles/Menu.css';

export default function Home () {

  return (
    <div className='page-root'>
      <menu className='dynamic-menu'>
        <div className='dynamic-menu-main'>
          <button>{ new Date().toDateString() }</button>
          <button>Welcome, User!</button>
        </div>

        <div className='dynamic-menu-main'>
          <button><img src='/log.svg' /> Add Log</button>
          <button><img src='/add-account.svg'/> Add Account</button>
        </div>
      </menu>

      <div className='page-main'>
        <div>
          Week Cal/List
        </div>

        <div>
          Account balances
        </div>

        <div>
          financial news/goals
        </div>
      </div>
    </div>
  );
}