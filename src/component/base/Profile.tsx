import React, { useState } from "react";
import { User } from "../../typedef";
import { addDays } from "../../typeassist";
import '../../styles/Profile.css';
import { invoke } from "@tauri-apps/api";

interface ProfileProps { user: User, setUser: React.Dispatch<React.SetStateAction<User | null>>, logout: () => void }
export default function Profile ({ user, setUser, logout }: ProfileProps) {

  const [email, setEmail] = useState(user.email ?? '');
  const [password, setPassword] = useState('');
  const [pass2, setPass2] = useState('');
  const [fname, setFname] = useState(user.fname ?? '');
  const [lname, setLname] = useState(user.lname ?? '');
  const [dob, setDob] = useState(user.dob ?? null);

  const [oldPass, setOldPass] = useState('');

  const [error, setError] = useState('');

  const updateUser = async () => {
    if (password !== pass2) { setError('Passwords do not match'); return; }
    
    const data = { 
      'id': user.id, 
      'password': oldPass,
      'newPass': password.length > 0 ? password : undefined,
      'email': email,
      'fname': fname,
      'lname': lname,
      'dob': dob ? new Date(dob.toDateString()) : undefined,
    }
    await invoke('fix_user', data)
      .then(data => {
        if (data !== null) setUser(data as User)
        else setError('Incorrect password');
      })
      .catch(err => setError(err));
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
          <button onClick={logout}>Logout</button>
        </div>
      </menu>

      <div className='page-main'>

        { stateFinancial ?
          <div className='profile-personal'>
            Financial Profile
          </div>
          :
          <div className='profile-personal'>
            <menu>
              <label>Username: </label><input type='text' placeholder='Username' value={user.uname} readOnly />
              <label>Recovery Email: </label><input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />

              <label>Full Name: </label>
              <input type='text' placeholder='First name' value={fname} onChange={(e) => setFname(e.target.value)} />
              <input type='text' placeholder='Last name' value={lname} onChange={(e) => setLname(e.target.value)} />
              <label htmlFor='dob'>Date of Birth: </label><input id='dob' type='date' value={dob ? dob.toISOString().substring(0, 10) : undefined} 
                onChange={(e) => setDob(addDays(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')), 0))} />

            </menu>
            <menu>
              <label>Confirm Password: </label>
              <input type='password' placeholder='Current password' value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
              <label>Upate Password: </label>
              <input type='password' placeholder='New password' value={password} onChange={(e) => setPassword(e.target.value)} />
              <input type='password' placeholder='Confirm password' value={pass2} onChange={(e) => setPass2(e.target.value)} />

              <div>
                <button onClick={updateUser}>Save</button>
                { error !== '' && <em>{ error }</em> }
              </div>
            </menu>

            
          </div>
        }
        

      </div>
    </div>
  )
}