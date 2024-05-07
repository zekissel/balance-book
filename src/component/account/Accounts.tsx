import { useEffect, useState } from "react"
import Menu, { MenuButton } from "../Menu"
import AddAccount from "./AddAccount";
import { Account, getAccounts } from "../../typedef";

interface AccountsProps { }
export default function Accounts({}: AccountsProps) {

  enum UIState { Checking, Credit, Savings, Loan, Investment }
  const [state, setState] = useState<UIState>(UIState.Checking);

  const [showAddAccount, setShowAddAccount] = useState<boolean>(false);
  const toggleAddAccount = () => setShowAddAccount(!showAddAccount);
  
  const [signal, setSignal] = useState<boolean>(false);
  const refresh = () => setSignal(!signal);

  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    async function fetchAccounts() { setAccounts(await getAccounts()) }
    fetchAccounts();
  }, [signal]);

  return (
    <div className='w-full'>
      <Menu
        leftPanel={
          <>
            <MenuButton onClick={() => setState(UIState.Checking)} children={<><img src='/menu/checking.svg' draggable={false} /> Checking</>} active={state === UIState.Checking} />
            <MenuButton onClick={() => setState(UIState.Credit)} children={<><img src='/menu/credit.svg' draggable={false} /> Credit</>} active={state === UIState.Credit} />
            <MenuButton onClick={() => setState(UIState.Savings)} children={<><img src='/menu/savings.svg' draggable={false} /> Savings</>} active={state === UIState.Savings} />
            <MenuButton onClick={() => setState(UIState.Loan)} children={<><img src='/menu/loan.svg' draggable={false} /> Loan</>} active={state === UIState.Loan} />
            <MenuButton onClick={() => setState(UIState.Investment)} children={<><img src='/menu/investment.svg' draggable={false} /> Investment</>} active={state === UIState.Investment} />

          </>
        }
        rightPanel={
          <>
            <MenuButton onClick={toggleAddAccount} children={<><img src='/menu/add-account.svg' draggable={false} />{' '}Add Account</>} active={false} />
          </>
        }
      />

      { showAddAccount && <AddAccount cancel={() => {refresh(); toggleAddAccount();}} />}

      <main>
      
        { state === UIState.Checking &&
          <>checking
          
            { accounts.map((a) => <div key={a.id}>{a.name} {a.balance}</div>) }
          </>
        }
      </main>

    </div>
  )
}