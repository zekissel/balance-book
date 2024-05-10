import { useEffect, useMemo, useState } from "react"
import Menu, { MenuButton } from "../Menu"
import AddAccount from "./AddAccount";
import { Account, getAccounts, Transaction, getCalendarTransactions, addDays } from "../../typedef";
import { empty_filter, Filter } from "../filter";
import AccountView from "./AccountView";

interface AccountsProps { }
export default function Accounts({}: AccountsProps) {

  enum UIState { Spend, Save, Other }
  const [state, setState] = useState<UIState>(UIState.Spend);

  const [showAddAccount, setShowAddAccount] = useState<boolean>(false);
  const toggleAddAccount = () => setShowAddAccount(!showAddAccount);
  
  const [signal, setSignal] = useState<boolean>(false);
  const refresh = () => setSignal(!signal);

  const [logs, setLogs] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const spendAccounts = useMemo(() => {
    return accounts.filter(a => ['Checking', 'Credit'].includes(a.type))
  }, [accounts]);

  const saveAccounts = useMemo(() => {
    return accounts.filter(a => ['Saving', 'Investment'].includes(a.type))
  }, [accounts]);

  const otherAccounts = useMemo(() => {
    return accounts.filter(a => ['Loan', 'Other'].includes(a.type))
  }, [accounts]);

  useEffect(() => {
    async function fetchAccounts() { setAccounts(await getAccounts()) }
    fetchAccounts();
  }, [signal]);

  useEffect(() => {
    const fetchLogs = async () => {
      const filter: Filter = { ...empty_filter, 
        start_date: addDays(new Date(), -31),
        end_date: addDays(new Date(), 0),
      };
      const trans = await getCalendarTransactions(filter);
      setLogs(trans);
    }
    fetchLogs();
  }, []);

  const relaventLogs = useMemo(() => {
    return logs.filter(t => {
      switch (state) {
        case UIState.Spend: return spendAccounts.map(a => a.id).includes(t.account_id);
        case UIState.Save: return saveAccounts.map(a => a.id).includes(t.account_id);
        case UIState.Other: return otherAccounts.map(a => a.id).includes(t.account_id);
      }
    })
  }, [logs, state]);

  return (
    <div className='w-full'>
      <Menu
        leftPanel={
          <>
            <MenuButton onClick={() => setState(UIState.Spend)} children={<><img src='/menu/checking.svg' draggable={false} /> Spending</>} active={state === UIState.Spend} />
            <MenuButton onClick={() => setState(UIState.Save)} children={<><img src='/menu/savings.svg' draggable={false} /> Saving</>} active={state === UIState.Save} />
            <MenuButton onClick={() => setState(UIState.Other)} children={<><img src='/menu/loan.svg' draggable={false} /> Other</>} active={state === UIState.Other} />
          </>
        }
        rightPanel={
          <>
            <MenuButton onClick={toggleAddAccount} children={<><img src='/menu/add-account.svg' draggable={false} />{' '}Add Account</>} active={false} />
          </>
        }
      />

      { showAddAccount && <AddAccount cancel={() => {refresh(); toggleAddAccount();}} />}

      
      <AccountView 
        accounts={state === UIState.Spend ? spendAccounts : (state === UIState.Save ? saveAccounts : otherAccounts)} 
        types={state === UIState.Spend ? { type1: 'Checking', type2: 'Credit' } : (state === UIState.Save ? { type1: 'Savings', type2: 'Investment' } : { type1: 'Loan', type2: 'Other' })}
        logs={relaventLogs}
        refresh={refresh}
      />

    </div>
  )
}