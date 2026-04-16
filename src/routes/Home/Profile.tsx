import { useNavigate, NavLink } from "react-router";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { Account, /*Transaction*/ } from "../../typedef";
import { AddAccount } from "./AccountTools";

interface ProfileProps {
  refresh: () => void; /* signals an update to accounts/transactions */
  accounts: Account[];
  //transactions: Transaction[];
}
export default function Profile ({ accounts, /*transactions*/ refresh }: ProfileProps) {

  const [newName, setNewName] = useState('');

  const [uiDeleteConfirm, setUiDeleteConfirm] = useState(false);
  const nav = useNavigate();


  const deleteProfile = async () => {
    await invoke("delete_user", { 
      id_i: location.pathname.split('/').pop() as string
    })
      .then((_del) => nav("/login"))
      .catch((e) => { {
        console.error("error deleting user:", e);
      }});
  }

  const updateProfile = async () => {
    if (newName === '') return;
    await invoke("update_user", { 
      id_i: location.pathname.split('/').pop() as string,
      new_name: newName
    })
      .then((updated) => { console.log("user updated:", updated); })
      .catch((e) => { {
        console.error("error updating user:", e);
      }});
  }

  
  return (
    <div className='profile-main'>
      
      <div className='profile-accounts'>

        <ul>
          { accounts.map((acct) => (
            <NavLink to={`account/${acct.id}`} key={acct.id}>
              <li key={acct.id}>
                <span>{acct.name}</span>
                <span>{acct.balance}</span>
                <span>{acct.category}</span>
                <span>{acct.timestamp}</span>

                
                  
                
              </li>
            </NavLink>
          )) }

          <AddAccount refresh={refresh} />
        </ul>
      </div>

      <div className='profile-plaid'>

      </div>

      <div className='profile-edit'>
        <input 
          type='text' placeholder='Change name' 
          value={newName} onChange={(e) => setNewName(e.target.value)} 
        />
        <button onClick={updateProfile}>Save</button>
        <button onClick={() => setUiDeleteConfirm(true)}>Delete Profile</button>
      </div>



      { uiDeleteConfirm && 
        <div>
          <p>Are you sure you want to delete this profile?</p>
          <button onClick={deleteProfile}>Confirm Delete</button>
          <button onClick={() => setUiDeleteConfirm(false)}>Cancel</button>
        </div>
      }
        
    </div>
  )
}