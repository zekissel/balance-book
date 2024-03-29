import { useState, useMemo } from "react"
import { Account, AccountType, Transaction } from "../../typedef"
import { addDays } from "../../typeassist";

interface PreviewProps { accounts: Account[], transactions: Transaction[] }
export default function Preview ({ accounts, transactions }: PreviewProps) {

  const [curView, setCurView] = useState(AccountType.Checking)
  const [curID, setCurID] = useState(Number(localStorage.getItem('accountDefault')) ?? 0);

  const recentTransactions = useMemo(() => {
    const minDate = addDays(new Date(), -3);
    const ret = transactions.filter(t => accounts.find(a => a.id === t.account_id)?.account_type === curView);
    return ret.filter(t => t.date >= minDate).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions, curView]);

  const focusAccounts = useMemo(() => {
    return accounts.filter(a => a.account_type === curView);
  }, [curView]);
  const curIndex = useMemo(() => { return focusAccounts.findIndex(a => a.id === curID); }, [focusAccounts, curID]);

  const handleRadio = (view: AccountType) => {
    setCurView(view);
    setCurID(accounts.find(a => a.account_type === view)?.id ?? 0);
  }
  const seekAccount = (positive: boolean) => {
    const nextIndex = positive ? curIndex + 1 : curIndex - 1;
    setCurID(focusAccounts[nextIndex].id);
  }

  return (
    <div className='home-preview'>

      <div>
        <menu><button disabled={curIndex <= 0} onClick={() => seekAccount(false)}>&lt;</button><button disabled={curIndex >= focusAccounts.length - 1} onClick={() => seekAccount(true)}>&gt;</button></menu>
        { focusAccounts.filter(a => a.id === curID).map(a => 
          <div>{ a.account_name }</div>
        )}
        <menu>
          <input type='radio' name='home-account' id='check' defaultChecked={curView === AccountType.Checking} onChange={() => handleRadio(AccountType.Checking)} /><label htmlFor="check">Checking</label>
          <input type='radio' name='home-account' id='save' defaultChecked={curView === AccountType.Savings} onChange={() => handleRadio(AccountType.Savings)} /><label htmlFor="save">Savings</label>
          <input type='radio' name='home-account' id='invest' defaultChecked={curView === AccountType.Investing} onChange={() => handleRadio(AccountType.Investing)} /><label htmlFor="invest">Investing</label>
        </menu>
      </div>

      <ol>
        { recentTransactions.filter(t => t.account_id === curID).map(t => 
          <li>{ t.company } { t.amount }</li>
        )}
      </ol>

    </div>
  )
}