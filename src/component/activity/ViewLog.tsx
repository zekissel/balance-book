import { Transaction, Account, formatAmount, formatAccount } from "../../typedef";
import { useState } from "react";
import { EditLog, UIState } from "./AddLog";
import { invoke } from "@tauri-apps/api";

interface ViewLogProps { 
  transaction: Transaction;
  account: Account;
  update: () => void;
  close: () => void;
}
export default function ViewLog({ transaction, account, update, close }: ViewLogProps) {

  enum LogUIState { View, Edit, Delete }
  const [state, setState] = useState<LogUIState>(LogUIState.View);

  const deleteLog = async () => {
    await invoke('remove_transaction', { id: transaction.id })
      .then(() => {
        update();
        close();
      })
  }

  return (
    <div className={'absolute z-50 bottom-12 right-12 bg-panel rounded-lg border-solid border-2 p-2 mx-auto ' + (['Transfer', 'Credit'].includes(transaction.category.split('>')[1]) ? 'border-neutral1 ' : (transaction.amount > 0 ? 'border-primary ' : 'border-negative1 '))}>
        
      { (state === LogUIState.View || state === LogUIState.Delete) &&
        <>
          
          <li className='bg-light2 p-1 rounded-lg flex flex-row w-full items-center justify-start m-1'>
            <span className='w-48 flex flex-col p-1'>
              <label className='text-sm'>
                { !['Transfer', 'Credit'].includes(transaction.category.split('>')[1]) ? 'Store' : (transaction.amount > 0 ? 'Source' : 'Destination')}: 
              </label>

              <span>{ transaction.store }</span>
            </span>

            <span className='w-1/4 p-1'>
              <label className='text-sm'>Amount: </label>
              <span className='flex flex-row'>{ formatAmount(transaction.amount, ['Transfer', 'Credit'].includes(transaction.category.split('>')[1])) }</span>
            </span>
          </li>

          <li className='flex flex-row w-full p-1 m-1 rounded-lg justify-start items-center bg-light2'>
            <span className='w-48 p-1'>
              <label className='text-sm'>Category: </label><br/>
              <span>{ `${transaction.category.split('>')[0]} >${transaction.category.split('>')[1]}` }</span>
            </span>

            <span className='flex flex-col p-1'>
              <label className='text-sm'>Date: </label>
              <span>{ transaction.date.toISOString().split('T')[0] }</span>
            </span>
          </li>

          <li className='bg-light2 p-2 rounded-lg flex flex-col w-full items-start justify-center m-1'>
            <span className='w-full flex flex-row justify-between items-center'>
              <label className='text-sm'>Desc: </label>

              <span className=''>
                <label className='text-sm'>{!['Transfer', 'Credit'].includes(transaction.category.split('>')[1]) ? 'Account' : (transaction.amount < 0 ? 'Source' : 'Destination')}: </label>
                <span>{ formatAccount(transaction.account_id, [account]) }</span>
              </span>
            </span>

            <textarea className='w-full h-14 mt-1 border-primary border-dashed border rounded' value={transaction.desc !== '' ? transaction.desc : 'n/a'} readOnly />
          </li>

          <div className='w-2/3 mx-auto flex flex-row justify-around items-center '>
            <button onClick={() => setState(LogUIState.Edit)} className={'p-2 bg-light2 rounded-lg border border-solid hover:opacity-75 ' + (['Transfer', 'Credit'].includes(transaction.category.split('>')[1]) ? 'border-neutral1 ' : (transaction.amount > 0 ? 'border-primary ' : 'border-negative1 '))}><img src='/misc/edit.svg' alt='edit' /></button>
            <button onClick={() => setState(LogUIState.Delete)} className='p-1 bg-warn1 text-white rounded-lg hover:opacity-75'><img src='/misc/delete.svg' alt='delete' /></button>
            <button onClick={close} className='p-2 bg-light2 rounded-lg border border-solid border-white hover:opacity-75'><img src='/misc/x.svg' alt='edit' /></button>
          </div>

          { state === LogUIState.Delete &&
            <div className='absolute z-55 bottom-0 right-0 w-full h-full bg-panel rounded-lg border-solid border-2 border-warn1 flex flex-col justify-center items-center'>
              <span className='font-semibold text-lg'>Confirm delete?</span>
              <span className='text-xs mb-2'>{transaction.id}</span>
              <button className='text-white bg-warn1 font-semibold p-1 rounded-lg mb-1 hover:opacity-75' onClick={deleteLog}>Delete</button>
              <button className='rounded-lg bg-bbgray1 hover:opacity-75' onClick={() => setState(LogUIState.View)}>Cancel</button>
            </div>
          }
        </>
      }
      
      { state === LogUIState.Edit &&
        <EditLog log={transaction} type={['Transfer', 'Credit'].includes(transaction.category.split('>')[1]) ? (UIState.Transfer) : (transaction.amount > 0 ? UIState.Deposit : UIState.Withdraw)} cancel={() => setState(LogUIState.View)} update={update} />
      }

      

    </div>
  )
}