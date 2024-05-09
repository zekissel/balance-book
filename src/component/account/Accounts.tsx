import { useEffect, useMemo, useState } from "react"
import Menu, { MenuButton } from "../Menu"
import AddAccount from "./AddAccount";
import { Account, getAccounts } from "../../typedef";
import SpendingAccounts from "./Spending";
import SavingAccounts from "./Saving";
import OtherAccounts from "./Other";

interface AccountsProps { }
export default function Accounts({}: AccountsProps) {

  enum UIState { Spend, Save, Other }
  const [state, setState] = useState<UIState>(UIState.Spend);

  const [showAddAccount, setShowAddAccount] = useState<boolean>(false);
  const toggleAddAccount = () => setShowAddAccount(!showAddAccount);
  
  const [signal, setSignal] = useState<boolean>(false);
  const refresh = () => setSignal(!signal);

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

      
      { state === UIState.Spend &&
        <SpendingAccounts accounts={spendAccounts} />
      }

      { state === UIState.Save &&
        <SavingAccounts accounts={saveAccounts} />
      }

      { state === UIState.Other &&
        <OtherAccounts accounts={otherAccounts} />
      }

    </div>
  )
}