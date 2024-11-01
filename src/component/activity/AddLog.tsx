import { useEffect, useState, useMemo } from "react"
import { Category, ExpenseLeaf, IncomeLeaf, Transaction, getAccounts, Account, CrossLeaf, formatAccount } from "../../typedef";
import TreeSelect from "../TreeSelect";
import { invoke } from "@tauri-apps/api/core";

export enum UIState { Withdraw, Transfer, Deposit }

interface AddLogProps { 
  cancel: () => void;
  update: () => void;
}
export default function AddLog ({ cancel, update }: AddLogProps) {

  
  const [state, setState] = useState<UIState>(UIState.Withdraw);

  // MARK: - Render AddLog
  return (
    <menu className={'absolute z-100 top-16 right-6 p-2 flex flex-col justify-around items-center  rounded-lg bg-panel border-solid border-2 ' + (state === UIState.Deposit ? 'border-primary' : (state === UIState.Withdraw ? 'border-negative1' : 'border-neutral1')) }>

      <span className='bg-light2 p-1 rounded-lg'>
        <input className='ml-1' id='type-inc' type='radio' value={UIState.Deposit} name='trans-type' onChange={(e) => setState(Number(e.target.value))} />
        <label className='mr-2 ml-1' htmlFor='type-inc'>Income</label>
        
        <input id='type-exp' type='radio' value={UIState.Withdraw} name='trans-type' onChange={(e) => setState(Number(e.target.value))} defaultChecked />
        <label className='mr-2 ml-1' htmlFor='type-exp'>Expense</label>
        
        <input id='type-tra' type='radio' value={UIState.Transfer} name='trans-type' onChange={(e) => setState(Number(e.target.value))} />
        <label className='mr-1 ml-1' htmlFor='type-tra'>Transfer</label>
      </span>

      <EditLog type={state} cancel={cancel} update={update} />

    </menu>
  )
}

interface EditLogProps {
  log?: Transaction;
  type: UIState;
  cancel: () => void;
  update: () => void;
}
export function EditLog ({ log, type, cancel, update }: EditLogProps) {

  const [typeState, setTypeState] = useState((log && log !== null) ? (type - 1 === 0 ? 1 : type - 1) : type - 1);

  const [edited, setEdited] = useState(false);
  const [editLog, setEditLog] = useState<Transaction>((log && log !== null) ? log : {
    id: '',
    store: '',
    amount: 0,
    category: typeState === 1 ? 'OtherIncome>Other' : 'Other>Other',
    date: new Date(),
    desc: '',
    account_id: '',
  });

  const [transferId, setTransferId] = useState('');
  
  useEffect(() => {
    setTypeState((log && log !== null) ? (type - 1 === 0 ? 1 : type - 1) : type - 1);
    if (log && log !== null) return
    
    setEditLog({
      id: '',
      store: '',
      amount: 0,
      category: typeState === 1 ? 'OtherIncome>Other' : 'Other>Other',
      date: new Date(),
      desc: '',
      account_id: '',
    });
    setAmount('0');
    setTransferId('');
  }, [type]);


  const [accounts, setAccounts] = useState<Account[]>([]);
  useEffect(() => {
    async function fetchAccounts() { setAccounts(await getAccounts()) }
    fetchAccounts();
  }, []);

  const matchOptions = () => {
    switch (typeState) {
      case 1:
        return IncomeLeaf;
      case -1:
        return ExpenseLeaf;
      default:
        return CrossLeaf;
    }
  }

  /* display amount as string (include decimal) */
  const [amount, setAmount] = useState(String(editLog!.amount / 100));
  const displayAmount = useMemo(() => {
		return `${Math.abs(Number(amount))}${amount.charAt(amount.length - 1) === '.' ? '.' : ''}${(amount.charAt(amount.length - 2) === '.' && amount.charAt(amount.length - 1) === '0') ? '.0' : ''}${(amount.charAt(amount.length - 3) === '.' && amount.charAt(amount.length - 1) === '0') ? (amount.charAt(amount.length - 2) === '0' ? `.00` : '0') : ''}`
  }, [amount]);

  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		const am = e.target.value;
		if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmount(am);
      setEditLog({ ...editLog!, amount: Number(e.target.value) * 100 });
      setEdited(true);
		}
	};

  const submitLog = async () => {
    const category = (type === UIState.Transfer && editLog.category.split('>')[0] == 'Finance') ? `FinanceIncome>${editLog.category.split('>')[1]}` : editLog.category; 
    const data = {
      id: editLog.id,
      store: typeState !== 0 ? editLog.store : formatAccount(editLog.account_id, accounts),
      amount: Math.ceil(editLog.amount) * (edited && typeState === -1 ? -1 : 1),
      category: category,
      date: editLog.date.toISOString().slice(0, 10),
      desc: editLog.desc,
      accountId: typeState !== 0 ? editLog.account_id : transferId,
    }
    if (data.store === '' || data.amount === 0 || data.accountId === '') return; // error handling


    if (log && log !== null) {
      await invoke('fix_transaction', data);
    } else {
      await invoke('new_transaction', data);
    }

    if (type === UIState.Transfer && transferId !== '' && (log === null || log === undefined)) {
      const category = `Financial>${editLog.category.split('>')[1]}`;
      const transferData = {
        store: formatAccount(transferId, accounts),
        amount: Math.ceil(editLog!.amount) * -1,
        category: category,
        date: editLog.date.toISOString().slice(0, 10),
        desc: editLog.desc,
        accountId: editLog.account_id,
      }
      await invoke('new_transaction', transferData);
    }

    update();
    cancel();
  }

  // MARK: - Render EditLog
  return (
    <menu className='flex flex-col justify-around items-center p-2 rounded'>

      {log && log !== null &&
        <li className='bg-light2 p-1 rounded-lg flex flex-row w-full items-center justify-center m-1'>
          <label htmlFor='typeselect' className='text-sm'>Type: </label>
          <select id='typeselect' value={typeState} onChange={(e) => {setTypeState(Number(e.target.value)); setEditLog({ ...editLog, category: e.target.value === '1' ? 'OtherIncome>Other' : 'Other>Other' })}}>
            <option value={-1}>Expense</option>
            {/*<option value={0}>Internal</option>*/}
            <option value={1}>Income</option>
          </select>
        </li>
      }
    

      <li className='bg-light2 p-1 rounded-lg flex flex-row w-full items-center justify-start m-1'>
        <span className='w-48 flex flex-col p-1'>
          <label className='text-sm'>
            { typeState !== 0 ? 'Store' : 'Destination'}: 
          </label>

          { typeState !== 0 ? 
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
            value={[editLog.category]}
            options={matchOptions()}
            onChange={(c) => setEditLog({ ...editLog!, category: c.length > 0 ? (c[0] as Category) : ( typeState ===1 ? 'OtherIncome>Other' : 'Other>Other' ) })}
            multi={false}
          />
        </span>

        <span className='flex flex-col p-1'>
          <label className='text-sm'>Date: </label>
          <input className='border-primary border-dashed border rounded' type='date' value={editLog.date.toISOString().slice(0, 10)} onChange={(e) => setEditLog({ ...editLog!, date: new Date(e.target.value) })}/>
        </span>
      </li>


      <li className='bg-light2 p-2 rounded-lg flex flex-col w-full items-start justify-center m-1'>
        <span className='w-full flex flex-row justify-between items-center'>
          <label className='text-sm'>Desc: </label>

          <span className=''>
            <label className='text-sm'>{ typeState !== 0 ? 'Account' : 'Source'}: </label>
            <select className='border-primary border-dashed border rounded' value={editLog.account_id} onChange={(e) => setEditLog({ ...editLog!, account_id: e.target.value })}>
              <option value=''>Select Account</option>
              { accounts.map((a) => <option key={a.id} value={a.id}>{`${a.type_.slice(0,5)}:${a.name}`}</option>) }
            </select>
          </span>
        </span>

        <textarea className='w-full h-14 mt-1 border-primary border-dashed border rounded' value={editLog!.desc} onChange={(e) => setEditLog({ ...editLog!, desc: e.target.value })} />
      </li>


      <li className='bg-light2 p-2 m-1 rounded-lg flex flex-row w-2/3 items-center justify-around '>
        <button className={'p-2 rounded-lg text-light2 hover:opacity-80 ' + (typeState === 1 ? 'bg-primary' : (typeState === -1 ? 'bg-negative1' : 'bg-neutral1'))} onClick={submitLog}>Save</button>

        { false &&
          <button className='p-1 rounded-lg text-light2 bg-warn1 hover:opacity-80' onClick={() => {}}>Delete</button>
        }

        <button className='p-2 rounded-lg bg-light1 hover:bg-bbgray1' onClick={cancel}>Cancel</button>
      </li>
      
    </menu>
  )
}

