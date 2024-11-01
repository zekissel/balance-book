import { Transaction, Account, formatAmount, formatAccount, getAccounts, Category, CrossLeaf, IncomeLeaf, ExpenseLeaf } from "../../typedef";
import TreeSelect from "../TreeSelect";
import { useMemo, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface MultiLogProps { 
  transactions: Transaction[];
  accounts: Account[];
  update: () => void;
  close: () => void;
  type: number;
}
export default function ViewMultiLog({ transactions, accounts, update, close, type }: MultiLogProps) {

  enum LogUIState { View, Edit, Delete }
  const [state, setState] = useState<LogUIState>(LogUIState.View);

  const deleteLog = async () => {
    transactions.forEach(async (transaction) => {
      await invoke('remove_transaction', { id: transaction.id })
    })
    
    update();
    //close();
  }

  const aggregateStore = useMemo(() => {
    const store = transactions[0].store;
    return transactions.every((transaction) => transaction.store === store) ? store : 'Multiple';
  }, [transactions]);

  const aggregateAmount = useMemo(() => {
    const amount = transactions[0].amount;
    return transactions.every((transaction) => transaction.amount === amount) ? amount : 'Multiple';
  }, [transactions]);

  const aggregateCategory = useMemo(() => {
    const category = transactions[0].category;
    return transactions.every((transaction) => transaction.category === category) ? category : 'Multiple';
  }, [transactions]);

  const aggregateDate = useMemo(() => {
    const date = transactions[0].date;
    return transactions.every((transaction) => transaction.date === date) ? date : 'Multiple';
  }, [transactions]);

  const aggregateDesc = useMemo(() => {
    const desc = transactions[0].desc;
    return transactions.every((transaction) => transaction.desc === desc) ? desc : 'Multiple';
  }, [transactions]);

  const aggregateAccount = useMemo(() => {
    const account = transactions[0].account_id;
    return transactions.every((transaction) => transaction.account_id === account) ? account : 'Multiple';
  }, [transactions]);

  return (
    <div className={'absolute z-50 bottom-12 right-12 bg-panel rounded-lg border-solid border-2 p-2 mx-auto ' + (type === 0 ? 'border-neutral1 ' : (type > 0 ? 'border-primary ' : 'border-negative1 '))}>

      <h4 className='font-semibold mx-auto w-fit '>{ transactions.length } {type !== 0 ? (type > 0 ? 'deposits' : 'withdrawals') : 'transactions'}</h4>
        
      { (state === LogUIState.View || state === LogUIState.Delete) &&
        <>
          
          <li className='bg-light2 p-1 rounded-lg flex flex-row w-full items-center justify-start m-1'>
            <span className='w-48 flex flex-col p-1'>
              <label className='text-sm'>
                { type !== 0 ? 'Store' : 'Destination'}: 
              </label>

              <span>{ aggregateStore }</span>
            </span>

            <span className='w-1/4 p-1'>
              <label className='text-sm'>Amount: </label>
              <span className='flex flex-row'>{ formatAmount(aggregateAmount, type === 0) }</span>
            </span>
          </li>

          <li className='flex flex-row w-full p-1 m-1 rounded-lg justify-start items-center bg-light2'>
            <span className='w-48 p-1'>
              <label className='text-sm'>Category: </label><br/>
              <span>{ `${aggregateCategory.split('>')[0]} ` + (aggregateCategory !== 'Multiple' ? (`>${aggregateCategory.split('>')[1]}`) : '') }</span>
            </span>


            <span className='flex flex-col p-1'>
              <label className='text-sm'>Date: </label>
              <span>{ aggregateDate === 'Multiple' ? aggregateDate : aggregateDate.toISOString().split('T')[0] }</span>
            </span>
          </li>

          <li className='bg-light2 p-2 rounded-lg flex flex-col w-full items-start justify-center m-1'>
            <span className='w-full flex flex-row justify-between items-center'>
              <label className='text-sm'>Desc: </label>

              <span className=''>
                <label className='text-sm'>{type !== 0 ? 'Account' : 'Source'}: </label>
                <span>{ aggregateAccount !== 'Multiple' ? formatAccount(aggregateAccount, accounts) : aggregateAccount }</span>
              </span>
            </span>

            <textarea className='w-full h-14 mt-1 border-primary border-dashed border rounded' value={aggregateDesc !== '' ? aggregateDesc : 'n/a'} readOnly />
          </li>

          <div className='w-2/3 mx-auto flex flex-row justify-around items-center '>
            <button onClick={() => setState(LogUIState.Edit)} className={'p-2 bg-light2 rounded-lg border border-solid hover:opacity-75 ' + (type === 0 ? 'border-neutral1 ' : (type > 0 ? 'border-primary ' : 'border-negative1 '))}><img src='/misc/edit.svg' alt='edit' /></button>
            <button onClick={() => setState(LogUIState.Delete)} className='p-1 bg-warn1 text-white rounded-lg hover:opacity-75'><img src='/misc/delete.svg' alt='delete' /></button>
            <button onClick={close} className='p-2 bg-light2 rounded-lg border border-solid border-white hover:opacity-75'><img src='/misc/x.svg' alt='edit' /></button>
          </div>

          { state === LogUIState.Delete &&
            <div className='absolute z-55 bottom-0 right-0 w-full h-full bg-panel rounded-lg border-solid border-2 border-warn1 flex flex-col justify-center items-center'>
              <span className='font-semibold text-lg'>Confirm delete?</span>
              <span className='text-xs mb-2'>{transactions.length} transactions</span>
              <button className='text-white bg-warn1 font-semibold p-1 rounded-lg mb-1 hover:opacity-75' onClick={deleteLog}>Delete</button>
              <button className='rounded-lg bg-bbgray1 hover:opacity-75' onClick={() => setState(LogUIState.View)}>Cancel</button>
            </div>
          }
        </>
      }
      
      { state === LogUIState.Edit &&
        <EditMultiLog logs={transactions/*.map(t => t.id)*/} agg_log={{ store: aggregateStore, amount: aggregateAmount, category: aggregateCategory, date: aggregateDate, desc: aggregateDesc, account_id: aggregateAccount }} type={type + 1} cancel={() => setState(LogUIState.View)} update={update} />
      }

      

    </div>
  )
}


interface PseudoTransaction {
  store: string | 'Multiple';
  amount: number | 'Multiple';
  category: Category | 'Multiple';
  date: Date | 'Multiple';
  desc: string | 'Multiple';
  account_id: string | 'Multiple';
}
enum UIState { Withdraw, Transfer, Deposit }
interface EditMultiLogProps {
  logs: Transaction[];
  agg_log: PseudoTransaction;
  type: UIState;
  cancel: () => void;
  update: () => void;
}
function EditMultiLog ({ logs, agg_log, type, cancel, update}: EditMultiLogProps) {

  const [editLog, setEditLog] = useState<PseudoTransaction>(agg_log);
  const [transferId, setTransferId] = useState('');

  const [accounts, setAccounts] = useState<Account[]>([]);
  useEffect(() => {
    async function fetchAccounts() { setAccounts(await getAccounts()) }
    fetchAccounts();
  }, []);

  const matchOptions = () => {
    switch (type) {
      case UIState.Deposit:
        return IncomeLeaf;
      case UIState.Withdraw:
        return ExpenseLeaf;
      case UIState.Transfer:
        return CrossLeaf;
    }
  }

  /* display amount as string (include decimal) */
  const [amount, setAmount] = useState(String((editLog.amount !== 'Multiple' ? editLog.amount / 100 : 0)));
  const displayAmount = useMemo(() => {
		return `${Math.abs(Number(amount))}${amount.charAt(amount.length - 1) === '.' ? '.' : ''}${(amount.charAt(amount.length - 2) === '.' && amount.charAt(amount.length - 1) === '0') ? '.0' : ''}${(amount.charAt(amount.length - 3) === '.' && amount.charAt(amount.length - 1) === '0') ? (amount.charAt(amount.length - 2) === '0' ? `.00` : '0') : ''}`
  }, [amount]);

  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		const am = e.target.value;
		if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmount(am);
      setEditLog({ ...editLog!, amount: Number(e.target.value) * 100 });
		}
	};

  const submitLog = async () => {
    logs.forEach(async (log) => {
      const category = editLog.category !== 'Multiple' ? ((type === UIState.Transfer && editLog.category.split('>')[0] === 'Finance') ? (`${log.amount > 0 ? 'FinanceIncome' : 'Financial'}>${editLog.category.split('>')[1]}`) : editLog.category) : null;
      const data = {
        id: log.id,
        store: editLog.store !== 'Multiple' ? editLog.store : null,
        amount: (editLog.amount !== 'Multiple') ? Math.ceil(editLog.amount) * ((log.amount !== editLog.amount) && log.amount < 0 ? -1 : 1) : null,
        category: category,
        date: editLog.date !== 'Multiple' ? editLog.date.toISOString() : null,
        desc: editLog.desc !== 'Multiple' ? editLog.desc : null,
        accountId: editLog.account_id !== 'Multiple' ? editLog.account_id : null,
      }
  
      await invoke('fix_transaction', data);
    });

    update();
    cancel();
  }

  // MARK: - Render EditLog
  return (
    <menu className='flex flex-col justify-around items-center p-2 rounded'>

      <li className='bg-light2 p-1 rounded-lg flex flex-row w-full items-center justify-start m-1'>
        <span className='w-48 flex flex-col p-1'>
          <label className='text-sm'>
            { type !== UIState.Transfer ? 'Store' : 'Destination'}: 
          </label>

          { (type !== UIState.Transfer || !['Transfer', 'Credit'].includes(editLog.category.split('>')[1])) ? 
            <input className='w-40 border-primary border-dashed border rounded' type='text' value={editLog?.store} onChange={(e) => setEditLog({ ...editLog!, store: e.target.value })} />
            :
            <select className='border-primary border-dashed border rounded' value={transferId} onChange={(e) => {setEditLog({ ...editLog!, store: formatAccount(e.target.value, accounts) }); setTransferId(e.target.value)}}>
              <option value=''>Select Account</option>
              { accounts.map((a) => <option key={a.id} value={a.id}>{formatAccount(a.id, [a])}</option>) }
            </select>
          }
        </span>

        <span className='w-1/4 p-1'>
          <label className='text-sm'>Amount: </label>
          <input className='w-24 text-right border-primary border-dashed border rounded' type='text' value={displayAmount} onChange={handleAmount} />
        </span>
      </li>


      <li className='flex flex-row w-full p-1 m-1 rounded-lg justify-start items-center bg-light2'>
        <span className='w-48 p-1'>
          <label className='text-sm'>Category: </label>
          <TreeSelect
            value={[editLog!.category]}
            options={matchOptions()}
            onChange={(c) => setEditLog({ ...editLog, category: c.length > 0 ? (c[0] as Category) : ( type === UIState.Deposit ? 'OtherIncome>Other' : 'Other>Other' ) })}
            multi={false}
          />
        </span>

        <span className='flex flex-col p-1'>
          <label className='text-sm'>Date: </label>
          <input className='border-primary border-dashed border rounded' type='date' value={editLog.date !== 'Multiple' ? editLog.date.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)} onChange={(e) => setEditLog({ ...editLog, date: new Date(e.target.value) })}/>
        </span>
      </li>


      <li className='bg-light2 p-2 rounded-lg flex flex-col w-full items-start justify-center m-1'>
        <span className='w-full flex flex-row justify-between items-center'>
          <label className='text-sm'>Desc: </label>

          <span className=''>
            <label className='text-sm'>{ type !== UIState.Transfer ? 'Account' : 'Source'}: </label>
            <select className='border-primary border-dashed border rounded' value={editLog.account_id} onChange={(e) => setEditLog({ ...editLog, account_id: e.target.value })}>
              <option value='Multiple'>Multiple Accounts</option>
              { accounts.map((a) => <option key={a.id} value={a.id}>{`${a.type.slice(0,5)}:${a.name}`}</option>) }
            </select>
          </span>
        </span>

        <textarea className='w-full h-14 mt-1 border-primary border-dashed border rounded' value={editLog!.desc} onChange={(e) => setEditLog({ ...editLog!, desc: e.target.value })} />
      </li>


      <li className='bg-light2 p-2 m-1 rounded-lg flex flex-row w-2/3 items-center justify-around '>
        <button className={'p-2 rounded-lg text-light2 hover:opacity-80 ' + (type === UIState.Deposit ? 'bg-primary' : (type === UIState.Withdraw ? 'bg-negative1' : 'bg-neutral1'))} onClick={submitLog}>Save</button>

        <button className='p-2 rounded-lg bg-light1 hover:bg-bbgray1' onClick={cancel}>Cancel</button>
      </li>
      
    </menu>
  )
}