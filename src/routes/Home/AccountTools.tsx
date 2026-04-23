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
  const toggleEdit = () => {setUiEdit(!uiEdit); setUiDeleteConfirmAcct(false); }

  const [new_acct_name, setNewAcctName] = useState('');
  const [new_category, setNewCategory] = useState('');
  const [new_balance, setNewBalance] = useState(0);

  const [new_trans_store, setNewTransStore] = useState('');
  const [new_trans_amount, setNewTransAmount] = useState(0);
  const [new_trans_category, setNewTransCategory] = useState('');
  const [new_trans_timestamp, setNewTransTimestamp] = useState('');
  const [new_trans_description, setNewTransDescription] = useState('');

  const [uiDeleteConfirmAcct, setUiDeleteConfirmAcct] = useState(false);
  const [uiAddTransaction, setUiAddTransaction] = useState(false);
  const toggleAddTransaction = () => { setUiAddTransaction(!uiAddTransaction); setUiDeleteConfirmAcct(false); setNewTransAmount(0); setNewTransCategory(''); setNewTransDescription(''); setNewTransStore(''); setNewTransTimestamp(''); }

  const navigate = useNavigate();
  useEffect(() => {
    const acct = accounts.find(a => a.id === location.pathname.split('/').pop());
    if (!acct) {
      console.error("account not found:", location.pathname.split('/').pop());
      navigate("/profile/" + location.pathname.split('/')[2]);
      return;
    }
    setAccount(acct);
    setNewAcctName(acct.name);
    setNewCategory(acct.category);
    setNewBalance(acct.balance);
  }, [accounts, uiEdit]);
  
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

  const deleteAccount = async () => {
    await invoke("delete_account", { 
      id_i: location.pathname.split('/').pop() as string
    })
      .then((_del) => {refresh(); navigate(`/profile/${location.pathname.split('/')[2]}`)})
      .catch((e) => { {
        console.error("error deleting account:", e);
    }});
  }

  const addTransaction = async () => {
    await invoke("create_transaction", { 
      amount: new_trans_amount,
      timestamp: new_trans_timestamp,
      store: new_trans_store,
      category: new_trans_category,
      description: new_trans_description,
      account_id: location.pathname.split('/').pop() as string,
    })
      .then((updated) => { 
        console.log("account updated:", updated); 
        refresh(); 
        setUiAddTransaction(false);
        setNewTransAmount(0);
        setNewTransCategory('');
        setNewTransDescription('');
        setNewTransStore('');
        setNewTransTimestamp('');
      })
      .catch((e) => { {
        console.error("error updating account:", e);
      }});
  }


  return (
    <div>
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
            <button onClick={() => deleteAccount()}>
              Confirm Delete
            </button>

            <button onClick={() => setUiDeleteConfirmAcct(false)}>
              <img src='/cancel.svg' alt='Cancel' />
            </button>
          </div>
        }
      </>}


      <div>
        <span>
          <input value={new_acct_name} onChange={(e) => setNewAcctName(e.target.value)} disabled={!uiEdit} />
        </span>
        <span>
          <input type='number' value={new_balance} onChange={(e) => setNewBalance(e.target.valueAsNumber)} disabled={!uiEdit} />
        </span>
        <span>
          <input value={new_category} onChange={(e) => setNewCategory(e.target.value)} disabled={!uiEdit} />
        </span>
        <span>{account?.timestamp ?? 'N/A'}</span>
      </div>

      <div>
        <button onClick={toggleAddTransaction}>
          <img src='/add.svg' alt='Manually add transaction' />
        </button>
      </div>

      { uiAddTransaction &&
        <div>
          <h3>Add transaction:</h3>

          <input type='text' placeholder='Store name' value={new_trans_store} onChange={(e) => setNewTransStore(e.target.value)} />
          <input type='number' placeholder='Amount' value={new_trans_amount} onChange={(e) => setNewTransAmount(e.target.valueAsNumber)} />
          <input type='text' placeholder='Category' value={new_trans_category} onChange={(e) => setNewTransCategory(e.target.value)} />
          <input type='datetime-local' placeholder='Timestamp' value={new_trans_timestamp} onChange={(e) => setNewTransTimestamp(e.target.value)} />
          <input type='text' placeholder='Description' value={new_trans_description} onChange={(e) => setNewTransDescription(e.target.value)} />

          <button onClick={addTransaction}>
            <img src='/save.svg' alt='Save' />
          </button>
          <button onClick={toggleAddTransaction}>
            <img src='/cancel.svg' alt='Cancel' />
          </button>
        </div>
      }
      
    </div>
  )
}



interface AddAccountProps { refresh: () => void; }
export function AddAccount ({ refresh }: AddAccountProps) {

  const [showUI, setShowUI] = useState(false);
  const [name, setAcctName] = useState('');
  const [accountType, setAccountType] = useState('');

  const createAccount = async () => {
    await invoke("create_account", { 
      balance: 0, 
      timestamp: new Date().toISOString(), 
      name, 
      category: accountType, 
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
          <input type="text" placeholder="Account type" value={accountType} onChange={(e) => setAccountType(e.target.value)} />
          <button onClick={() => createAccount()}>
            <img src='/save.svg' alt='Save'></img>
          </button>
          <button onClick={() => {setShowUI(false); setAcctName('');}}>
            <img src='/cancel.svg' alt='Cancel'></img>
          </button>
        </div>
      ) : (
        <button onClick={() => setShowUI(true)}>Add Account</button>
      )}

    </li>
  )
}