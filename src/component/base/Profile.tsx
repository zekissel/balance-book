import React, { useState } from "react";
import { User } from "../../typedef";
import '../../styles/Profile.css';
import { invoke } from "@tauri-apps/api";

interface ProfileProps { user: User, setUser: React.Dispatch<React.SetStateAction<User | null>>, logout: () => void }
export default function Profile ({ user, setUser, logout }: ProfileProps) {

  const [email, setEmail] = useState(user.email ?? '');
  const [password, setPassword] = useState('');
  const [pass2, setPass2] = useState('');

  const updateUser = async () => {
    if (password !== pass2) { console.error('Passwords do not match'); return; }
    
    const data = { 'id': user.id, 'email': email, 'password': password.length > 0 ? password : undefined }
    await invoke('fix_user', data)
      .then(data => {if (data !== null) setUser(data as User)})
      .catch(err => console.error(err));
  }

  const [stateFinancial, setStateFinancial] = useState(true)

  return (
    <div className='page-root'>
      <menu className='dynamic-menu'>
        <div className='dynamic-menu-main'>
          <button id={stateFinancial ? 'dynamic-menu-current' : undefined} onClick={() => setStateFinancial(true)}>Financial</button>
          <button id={!stateFinancial ? 'dynamic-menu-current' : undefined} onClick={() => setStateFinancial(false)}>Personal</button>
        </div>

        <div className='dynamic-menu-main'>
          <button>Lock</button>
          <button onClick={logout}>Logout</button>
        </div>
      </menu>

      <div className='page-main'>

        { stateFinancial ?
          <div className='profile-financial'>
            <p>work in progress; connect bank account with plaid/link</p>
          </div>
          :
          <div className='profile-personal'>
            <menu>
              <input type='text' placeholder='Name' value={user.name} readOnly/>
              <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type='text' placeholder='New password' value={password} onChange={(e) => setPassword(e.target.value)} />
              <input type='text' placeholder='Confirm new password' value={pass2} onChange={(e) => setPass2(e.target.value)} />

              <button onClick={updateUser}>Save</button>
            </menu>
          </div>
        }
        

      </div>
    </div>
  )
}