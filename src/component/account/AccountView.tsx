/* <MenuButton onClick={() => setState(UIState.Checking)} children={<><img src='/menu/checking.svg' draggable={false} /> Checking</>} active={state === UIState.Checking} />
<MenuButton onClick={() => setState(UIState.Credit)} children={<><img src='/menu/credit.svg' draggable={false} /> Credit</>} active={state === UIState.Credit} />
<MenuButton onClick={() => setState(UIState.Savings)} children={<><img src='/menu/savings.svg' draggable={false} /> Savings</>} active={state === UIState.Savings} />
<MenuButton onClick={() => setState(UIState.Loan)} children={<><img src='/menu/loan.svg' draggable={false} /> Loan</>} active={state === UIState.Loan} />
<MenuButton onClick={() => setState(UIState.Investment)} children={<><img src='/menu/investment.svg' draggable={false} /> Investment</>} active={state === UIState.Investment} /> */

import { Account, AccountType, Transaction } from "../../typedef";
import { useEffect, useMemo, useState } from "react";
import { EditAccount, UIState } from "./AddAccount";

interface AccountViewProps { 
  accounts: Account[]
  types: {
    type1: 'Checking' | 'Savings' | 'Loan';
    type2: 'Credit' | 'Investment' | 'Other';
  };
  logs: Transaction[];
  refresh: () => void;
}
export default function AccountView({ accounts, types, logs, refresh }: AccountViewProps) {

  const [curView, setCurView] = useState<typeof types.type1 | typeof types.type2>(types.type1);
  useEffect(() => {
    setCurView(types.type1)
  }, [types]);

  const primaryAccounts = accounts.filter(a => a.type === types.type1);
  const secondaryAccounts = accounts.filter(a => a.type === types.type2);

  const [editAccountId, setEditAccountId] = useState<string>('');
  const editAccount = useMemo(() => accounts.find(a => a.id === editAccountId), [editAccountId, accounts]);
  const editType = useMemo(() => {
    switch(editAccount?.type) {
      case AccountType.Checking: return UIState.Checking;
      case AccountType.Credit: return UIState.Credit;
      case AccountType.Savings: return UIState.Savings;
      case AccountType.Investment: return UIState.Investment;
      case AccountType.Loan: return UIState.Loan;
      default: return UIState.Checking;
    }
  }, [editAccount])

  const formatAmount = (amount: number) => (amount < 0 ? `-$${Math.abs(amount / 100).toFixed(2)}` : `$${(amount / 100).toFixed(2)}`);

  return (
    <main>

      <menu className='w-full h-12 flex flex-row justify-between bg-light1 '>

        <div className='flex flex-row items-center mx-2 '>
          Type: 
          <button className={'rounded-xl px-2 ' + (curView === types.type1 ? 'bg-primary2 ' : 'hover:opacity-75 ')} onClick={() => setCurView(types.type1)}>
            { types.type1 }
          </button>

          <button className={'rounded-xl px-2 ' + (curView === types.type2 ? 'bg-primary2 ' : 'hover:opacity-75 ')} onClick={() => setCurView(types.type2)}>
            { types.type2 }
          </button>
        </div>

        <div className='flex flex-row items-center mx-2 '>
          <span>
            Num. accounts: { curView === types.type1 ? primaryAccounts.length : secondaryAccounts.length }
          </span>
          <span>
            Value: ${ (curView === types.type1 ? primaryAccounts.reduce((acc, a) => acc + a.balance, 0) : secondaryAccounts.reduce((acc, a) => acc + a.balance, 0)) / 100 }
          </span>
        </div>

      </menu>

      { 
        (curView === types.type1 ? primaryAccounts : secondaryAccounts).map(a => (
          <section key={a.id} className='w-[calc(100%-1rem)] bg-panel p-2 m-2 rounded-lg flex '>
            
            <div className='flex flex-col items-center bg-light1 rounded-lg pt-1 pb-4 px-1 h-fit '>
              <button className='w-full pb-4 hover:opacity-65 ' onClick={() => setEditAccountId(a.id)}><img src='/misc/edit.svg' /></button>
              <h3><b>{ a.name }</b></h3>
              <h4 className='bg-white font-mono text-lg font-semibold rounded-xl px-2 '>{ formatAmount(a.balance) }</h4>
              <em className='text-center '>Last update: <br/> { `${a.date.split('.')[0]}` }</em>
            </div>
            { logs.filter(t => t.account_id === a.id).length }

          </section>
        ))
      }

      { editAccount !== undefined && 
        <EditAccountBase account={editAccount} type={editType} cancel={() => {refresh(); setEditAccountId('')}} />
      }

    </main>
  )
}

interface EditAccountBaseProps {
  account: Account;
  type: UIState;
  cancel: () => void;
}
function EditAccountBase({ account, type, cancel }: EditAccountBaseProps) {

  const [state, setState] = useState<UIState>(type);

  return (
    <div className={'absolute z-50 bottom-12 right-12 bg-panel rounded-lg border-solid border-2 p-2 mx-auto border-primary '}>

      <span className='bg-light2 p-1 rounded-lg'>
        <input className='ml-1' id='type-che' type='radio' value={UIState.Checking} name='acct-type' onChange={(e) => setState(Number(e.target.value))} defaultChecked={type === UIState.Checking} />
        <label className='mr-2 ml-1' htmlFor='type-che'>Checking</label>
        
        <input id='type-cre' type='radio' value={UIState.Credit} name='acct-type' onChange={(e) => setState(Number(e.target.value))} defaultChecked={type === UIState.Credit} />
        <label className='mr-2 ml-1' htmlFor='type-cre'>Credit</label>
        
        <input id='type-sav' type='radio' value={UIState.Savings} name='acct-type' onChange={(e) => setState(Number(e.target.value))} defaultChecked={type === UIState.Savings} />
        <label className='mr-1 ml-1' htmlFor='type-sav'>Savings</label>

        <input id='type-loa' type='radio' value={UIState.Loan} name='acct-type' onChange={(e) => setState(Number(e.target.value))} defaultChecked={type === UIState.Loan} />
        <label className='mr-1 ml-1' htmlFor='type-loa'>Loan</label>

        <input id='type-inv' type='radio' value={UIState.Investment} name='acct-type' onChange={(e) => setState(Number(e.target.value))} defaultChecked={type === UIState.Investment} />
        <label className='mr-1 ml-1' htmlFor='type-inv'>Investment</label>
      </span>
      
      <EditAccount acct={account} type={state} cancel={cancel} />


    </div>
  )
}