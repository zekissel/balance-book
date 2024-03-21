import { invoke } from "@tauri-apps/api/tauri";
import React, { useState } from "react";
import { AccountType, Account } from "../../typedef";


interface EditAccountProps { log: Account | null, type: AccountType, toggle: () => void, cancel: () => void, updateAccounts: () => void }
export function EditAccount ({ log, type, toggle, cancel, updateAccounts }: EditAccountProps) {

  const [name, setName] = useState(log ? log.account_name : '');
  const [balance, setBalance] = useState(log ? String(log.balance / 100) : '0');


  async function addAccount() {
    if (name === '') return;

    const data = {
      'id': log ? log.id : undefined,
      'accountType': log ? log.account_type : type,
      'accountId': name,
      'balance': Math.round((Number(balance) + Number.EPSILON) * 100),
      'date': new Date().toISOString(),
    };

    if (log) {
      await invoke("fix_account", data);
    }
    else {
      const account: Account = await invoke("new_account", data);
      switch (type) {
        case AccountType.Checking: localStorage.setItem('accountDefault', account.id.toString()); break;
        case AccountType.Savings: localStorage.setItem('accountSavings', account.id.toString()); break;
        case AccountType.Investing: localStorage.setItem('accountInvesting', account.id.toString()); break;
      }
    }
    
    updateAccounts();
    toggle();
  }

  const deleteAccount = () => {
    invoke("remove_account", { 'id': log!.id });
    if ([localStorage.getItem('accountDefault'), localStorage.getItem('accountSavings'), localStorage.getItem('accountInvesting')].includes(String(log!.id))) {
      switch (log!.account_type) {
        case AccountType.Checking: localStorage.removeItem('accountDefault'); break;
        case AccountType.Savings: localStorage.removeItem('accountSavings'); break;
        case AccountType.Investing: localStorage.removeItem('accountInvesting'); break;
      }
    }
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
        <li><label>Balance:</label><input type='text' value={balance} onChange={updateBalance}/></li>
      </div>

      { log &&
        <div className='new-trans-main'>
          <li><label>Last Update:</label><input type='text' value={log.date.toDateString()} disabled/></li>
        </div>
      }
      
      <li className='new-trans-meta'>
        <button className='new-trans-submit' onClick={addAccount}>Save</button>
        <button onClick={cancel}>Cancel</button>
        { log && <button className='delete-trans' onClick={deleteAccount}>Delete</button> }
      </li>
      
      
    </fieldset>
  );
}