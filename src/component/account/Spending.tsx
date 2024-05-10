/* <MenuButton onClick={() => setState(UIState.Checking)} children={<><img src='/menu/checking.svg' draggable={false} /> Checking</>} active={state === UIState.Checking} />
<MenuButton onClick={() => setState(UIState.Credit)} children={<><img src='/menu/credit.svg' draggable={false} /> Credit</>} active={state === UIState.Credit} />
<MenuButton onClick={() => setState(UIState.Savings)} children={<><img src='/menu/savings.svg' draggable={false} /> Savings</>} active={state === UIState.Savings} />
<MenuButton onClick={() => setState(UIState.Loan)} children={<><img src='/menu/loan.svg' draggable={false} /> Loan</>} active={state === UIState.Loan} />
<MenuButton onClick={() => setState(UIState.Investment)} children={<><img src='/menu/investment.svg' draggable={false} /> Investment</>} active={state === UIState.Investment} /> */

import { Account } from "../../typedef";

interface SpendingProps { accounts: Account[] }
export default function SpendingAccounts({ accounts }: SpendingProps) {

  const checkingAccounts = accounts.filter(a => a.type === 'Checking');
  const creditAccounts = accounts.filter(a => a.type === 'Credit');

  return (
    <main>



      { 
        accounts.map(a => (
          <li key={a.id}>
            { a.name } {a.type}
          </li>
        ))
      }
    </main>
  )
}