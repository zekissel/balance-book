import { useEffect, useState, useMemo } from "react"
import { Account, AccountType } from "../../typedef";
import { invoke } from "@tauri-apps/api";

enum UIState { Checking, Credit, Savings, Loan, Investment }

interface AddAccountProps { 
  cancel: () => void;
}
export default function AddAccount ({ cancel }: AddAccountProps) {

  const [state, setState] = useState<UIState>(UIState.Checking);

  // MARK: - Render AddLog
  return (
    <menu className={'absolute z-100 top-16 right-6 p-4 flex flex-col justify-around items-center  rounded-xl bg-panel border-solid border-2 border-primary'}>

      <span className='bg-light2 p-1 rounded-lg'>
        <input className='ml-1' id='type-che' type='radio' value={UIState.Checking} name='acct-type' onChange={(e) => setState(Number(e.target.value))} defaultChecked />
        <label className='mr-2 ml-1' htmlFor='type-che'>Checking</label>
        
        <input id='type-cre' type='radio' value={UIState.Credit} name='acct-type' onChange={(e) => setState(Number(e.target.value))} />
        <label className='mr-2 ml-1' htmlFor='type-cre'>Credit</label>
        
        <input id='type-sav' type='radio' value={UIState.Savings} name='acct-type' onChange={(e) => setState(Number(e.target.value))} />
        <label className='mr-1 ml-1' htmlFor='type-sav'>Savings</label>

        <input id='type-loa' type='radio' value={UIState.Loan} name='acct-type' onChange={(e) => setState(Number(e.target.value))} />
        <label className='mr-1 ml-1' htmlFor='type-loa'>Loan</label>

        <input id='type-inv' type='radio' value={UIState.Investment} name='acct-type' onChange={(e) => setState(Number(e.target.value))} />
        <label className='mr-1 ml-1' htmlFor='type-inv'>Investment</label>
      </span>

      <EditAccount type={state} cancel={cancel} />

    </menu>
  )
}

interface EditAccountProps {
  acct?: Account;
  type: UIState;
  cancel: () => void;
}
export function EditAccount ({ acct, type, cancel }: EditAccountProps) {

  const [editAccount, setEditAccount] = useState<Account>((acct && acct !== null) ? acct : {
    id: '',
    type: AccountType.Checking,
    name: '',
    balance: 0,
    date: new Date(),
    user_id: '',
  });

  useEffect(() => {
    setEditAccount({
      id: '',
      type: AccountType.Checking,
      name: '',
      balance: 0,
      date: new Date(),
      user_id: '',
    });
    setAmount('0');
  }, [type]);

  /* display amount as string (include decimal) */
  const [amount, setAmount] = useState(String(editAccount!.balance));
  const displayAmount = useMemo(() => {
		return `${Math.abs(Number(amount))}${amount.charAt(amount.length - 1) === '.' ? '.' : ''}${amount.charAt(amount.length - 2) === '.' && amount.charAt(amount.length - 1) === '0' ? '.0' : ''}`
    }, [amount]);

  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		const am = e.target.value;
		if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmount(am);
      setEditAccount({ ...editAccount!, balance: Number(e.target.value) });
		}
	};

  const submitLog = async () => {
    const data = {
      id: editAccount!.id,
      type: `${editAccount!.type}`,
      name: editAccount!.name,
      balance: editAccount!.balance,
    }
    if (data.name === '') return; // error handling

    if (acct && acct !== null) await invoke('fix_account', data);
    else await invoke('new_account', data);

    cancel();
  }

  // MARK: - Render EditLog
  return (
    <menu className='flex flex-col justify-around items-center p-2'>

      <li className='bg-light2 p-1 rounded-lg flex flex-row w-full items-center justify-start m-1'>
        <span className='w-48 flex flex-col p-1'>
          <label className='text-sm'>Name: </label>
          <input className='w-40 border-primary border-dashed border rounded' type='text' value={editAccount?.name} onChange={(e) => setEditAccount({ ...editAccount!, name: e.target.value })} />
        </span>

        <span className='w-1/4 p-1'>
          <label className='text-sm'>Balance: </label>
          <input className='w-24 text-right border-primary border-dashed border rounded' type='text' value={displayAmount} onChange={handleAmount} />
        </span>
      </li>
      

      <li className='bg-light2 p-2 m-1 rounded-lg flex flex-row w-2/3 items-center justify-around '>
        <button className={'p-2 rounded-lg text-light2 hover:opacity-80 bg-primary'} onClick={submitLog}>Save</button>
        <button className='p-1 rounded-lg bg-light1 hover:bg-bbgray1' onClick={cancel}>Cancel</button>

        { acct &&
          <button className='p-2 rounded-lg text-light2 bg-warn1 hover:opacity-80' onClick={() => {}}>Delete</button>
        }
      </li>
      
    </menu>
  )
}