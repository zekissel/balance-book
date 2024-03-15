import { invoke } from "@tauri-apps/api/tauri";
import React, { useState } from "react";
import { AccountType, Account } from "../../typedef";


interface EditAccountProps { log: Account | null, type: AccountType, toggle: () => void, cancel: () => void, updateAccounts: () => void }
export function EditAccount ({ log, type, toggle, cancel, updateAccounts }: EditAccountProps) {

  const [name, setName] = useState(log ? log.account_id : '');
  const [balance, setBalance] = useState(log ? String(log.balance / 100) : '0');


  async function addAccount() {
    if (name === '') return;

    const data = {
      'id': log ? log.id : undefined,
      'accountType': log ? log.account_type : type,
      'accountId': name,
      'balance': Math.round((Number(balance) + Number.EPSILON) * 100),
      'date': new Date(new Date().toDateString()),
    };

    if (log) await invoke("update_account", data);
    else await invoke("add_account", data);

    updateAccounts();
    toggle();
  }

  const deleteAccount = () => {
    invoke("delete_account", { 'id': log!.id });
    updateAccounts();
    toggle();
  }

  const updateBalance = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
    if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setBalance(am);
    }
  }

  return (
    <fieldset className={'new-trans'}>
      <legend>{ log ? 'Edit' : 'New' } { type.toString() } Account</legend>

      <div className='new-trans-main'>
        <li><label>Name: </label><input type='text' value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}/></li>
        <li><label>Amount: </label><input type='text' value={balance} onChange={updateBalance}/></li>
      </div>
      
      <li className='new-trans-meta'>
        <button className='new-trans-submit' onClick={addAccount}>Submit</button>
        <button onClick={cancel}>Cancel</button>
        { log && <button className='delete-trans' onClick={deleteAccount}>Delete</button> }
      </li>
      
      
    </fieldset>
  );
}