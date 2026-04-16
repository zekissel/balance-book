import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { invoke } from "@tauri-apps/api/core";
import { Account } from "../../typedef";

interface ProfileProps {
  refresh: () => void; /* signals an update to accounts/transactions */
  accounts: Account[];
  //transactions: Transaction[];
}
export function EditAccount ({ accounts, refresh }: ProfileProps) {

  const [account, setAccount] = useState<Account>();
  const [uiEdit, setUiEdit] = useState(false);
  const toggleEdit = () => {setUiEdit(!uiEdit); setUiDeleteConfirmAcct(false);}

  const [new_acct_name, setNewAcctName] = useState('');
  const [new_category, setNewCategory] = useState('');
  const [new_balance, setNewBalance] = useState(0);

  const [uiDeleteConfirmAcct, setUiDeleteConfirmAcct] = useState(false);

  const nav = useNavigate();
  useEffect(() => {
    const acct = accounts.find(a => a.id === location.pathname.split('/').pop());
    if (!acct) {
      console.error("account not found:", location.pathname.split('/').pop());
      nav("/profile/" + location.pathname.split('/')[2]);
      return;
    }
    setAccount(acct);
    setNewAcctName(acct.name);
    setNewCategory(acct.category);
    setNewBalance(acct.balance);
  }, [accounts]);
  
  const updateAccount = async () => {

    await invoke("update_account", { 
      id_i: location.pathname.split('/').pop() as string,
      user_id_i: location.pathname.split('/')[2] as string,
      new_name: new_acct_name === '' ? undefined : new_acct_name,
      new_category: new_category === '' ? undefined : new_category,
      new_balance: new_balance,
      new_timestamp: new Date().toISOString(),
    })
      .then((updated) => { 
        console.log("account updated:", updated); 
        refresh(); 
        toggleEdit();
      })
      .catch((e) => { {
        console.error("error updating account:", e);
      }});
  }

  const deleteAccount = async (accountId: string) => {
    await invoke("delete_account", { 
      id_i: accountId
    })
      .then((_del) => {refresh(); nav(`/profile/${location.pathname.split('/')[2]}`)})
      .catch((e) => { {
        console.error("error deleting account:", e);
    }});
  }


  return (
    <div>
      <div>
        <span>
          <input value={new_acct_name} onChange={(e) => setNewAcctName(e.target.value)} readOnly={!uiEdit} />
        </span>
        <span>
          <input type='number' value={new_balance} onChange={(e) => setNewBalance(e.target.valueAsNumber)} readOnly={!uiEdit} />
        </span>
        <span>
          <input value={new_category} onChange={(e) => setNewCategory(e.target.value)} readOnly={!uiEdit} />
        </span>
        <span>{account?.timestamp ?? 'N/A'}</span>
      </div>

      { uiEdit &&
        <button onClick={updateAccount}>
          <img  src={'/save.svg'} alt={'Save'} />
        </button>
      }

      <button onClick={toggleEdit}>
        <img 
          src={ uiEdit ? '/cancel.svg' : '/edit.svg' }
          alt={ uiEdit ? 'Cancel' : 'Edit' } 
        />
      </button>

      { !uiEdit && <>
        <button onClick={() => setUiDeleteConfirmAcct(true)}>
          Delete Account
        </button>
        { uiDeleteConfirmAcct &&
          <div>
            <p>Are you sure you want to delete this account?</p>
            <button onClick={() => deleteAccount(location.pathname.split('/').pop() as string)}>
              Confirm Delete
            </button>

            <button onClick={() => setUiDeleteConfirmAcct(false)}>
              <img src='/cancel.svg' alt='Cancel' />
            </button>
          </div>
        }
      </>}
    </div>
  )
}



interface AddAccountProps { refresh: () => void; }
export function AddAccount ({ refresh }: AddAccountProps) {

  const [showUI, setShowUI] = useState(false);
  const [name, setAcctName] = useState('');
  //const [accountType, setAccountType] = useState('');

  const createAccount = async () => {
    await invoke("create_account", { 
      balance: 0, 
      timestamp: new Date().toISOString(), 
      name, 
      category: "other", 
      user_id: location.pathname.split('/').pop() as string 
    })
      .then((_acct) => {refresh(); setShowUI(false); setAcctName('');})
      .catch((e) => { {
        console.error("error creating account:", e);
      }});
  }

  return (
    <li>
      {showUI ? (
        <div className="add-account-ui">
          <input type="text" placeholder="Account name" value={name} onChange={(e) => setAcctName(e.target.value)} />
          <button onClick={() => createAccount()}>
            <img src='/save.svg' alt='Save'></img>
          </button>
          <button onClick={() => setShowUI(false)}>
            <img src='/cancel.svg' alt='Cancel'></img>
          </button>
        </div>
      ) : (
        <button onClick={() => setShowUI(true)}>Add Account</button>
      )}

    </li>
  )
}