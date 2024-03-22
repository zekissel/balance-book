import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import { User } from "../../typedef";

interface AuthProps { verify: (user: User) => void, logout: () => void}
export default function Auth ({ verify, logout }: AuthProps) {

  const [name, setName] = useState(localStorage.getItem('user') ?? '');
  const [pass, setPass] = useState(localStorage.getItem('pass') ?? '');
  const [confirmPass, setConfirmPass] = useState('');

  const login = async () => {
    await invoke('login', { 'name': name, 'password': pass })
      .then(data => {
        if (data === null) logout();
        else verify(data as User);
      })
      .catch(err => console.error(err));
  }
  const [showRegister, setShowRegister] = useState(false);
  const register = async () => {
    if (pass === confirmPass) {
      await invoke('register', { 'name': name, 'password': pass })
        .then(data => {
          if (data === null) logout();
          else verify(data as User);
        })
        .catch(err => console.error(err));
    }
    else console.error('Passwords do not match');
  }

  const handleRegister = () => {
    if (name.length > 0 && pass.length > 0 && !showRegister) { setShowRegister(!showRegister); return; }
    if (name.length > 0 && pass.length > 0 && confirmPass.length > 0) { register(); return; }
  }

  return (
    <div className='no-auth'>
      <div className='auth-field'>
        <input type='text' placeholder='Username' value={name} onChange={e => setName(e.target.value)} />
        <input type='password' placeholder='Password' value={pass} onChange={e => setPass(e.target.value)} />
        { showRegister && <input type='password' placeholder='Confirm Password' value={confirmPass} onChange={e => setConfirmPass(e.target.value)} /> }
        { !showRegister && <button onClick={login}>Login</button> }
        <button onClick={handleRegister}>Register</button>
        { showRegister && <button onClick={() => setShowRegister(!showRegister)}>Cancel</button> }
      </div>
    </div>
  )
}