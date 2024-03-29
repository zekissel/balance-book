import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { User, DataState } from "../../typedef";

interface AuthProps { verify: (user: User) => void, logout: () => void}
export default function Auth ({ verify, logout }: AuthProps) {

  const [dataState, setDataState] = useState(DataState.Success);
  const [error, setError] = useState('');
  useEffect(() => { 
    const timer = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(timer);
   }, [error]);
   useEffect(() => { 
    const timer = setTimeout(() => setDataState(DataState.Success), 5000);
    return () => clearTimeout(timer);
   }, [dataState]);

  const [name, setName] = useState(localStorage.getItem('user') ?? '');
  const [pass, setPass] = useState(localStorage.getItem('pass') ?? '');
  const [confirmPass, setConfirmPass] = useState('');

  const enterLogin = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') login(); }
  const login = async () => {
    setDataState(DataState.Loading);
    await invoke('login', { 'name': name, 'password': pass })
      .then(data => {
        if (data === null) {logout(); setError('Invalid credentials'); setDataState(DataState.Error);}
        else {
          const user = data as User;
          user.dob = user.dob ? new Date(user.dob) : null;
          verify(user);
          setDataState(DataState.Success);
        }
      })
      .catch(() => setDataState(DataState.Error));
  }
  const [showRegister, setShowRegister] = useState(false);
  const toggleRegister = () => setShowRegister(!showRegister);
  const register = async () => {
    if (pass === confirmPass) {
      setDataState(DataState.Loading);
      await invoke('register', { 'name': name, 'password': pass })
        .then(data => {
          if (data === null) {logout(); setError('Username already in use'); setDataState(DataState.Error);}
          else {
            const user = data as User;
            user.dob = user.dob ? new Date(user.dob) : null;
            verify(user);
            setDataState(DataState.Success);
          }
        })
        .catch(() => setDataState(DataState.Error));
    }
    else setError('Passwords do not match');
  }

  const handleRegister = () => {
    if (!showRegister) { toggleRegister(); return; }
    if (name.length > 0 && pass.length > 0 && confirmPass.length > 0) { register(); return; }
  }

  return (
    <div className='no-auth'>
      <div className='auth-field'>
        <input type='text' placeholder='Username' value={name} onChange={e => setName(e.target.value)} />
        <input type='password' placeholder='Password' value={pass} onChange={e => setPass(e.target.value)} onKeyDown={enterLogin} />
        { showRegister && <input type='password' placeholder='Confirm Password' value={confirmPass} onChange={e => setConfirmPass(e.target.value)} /> }
        { !showRegister && <button onClick={login}>Login</button> }
        <button onClick={handleRegister} disabled={dataState === DataState.Loading}>Register</button>
        { showRegister && <button onClick={toggleRegister} disabled={dataState === DataState.Loading}>Cancel</button> }
        { dataState === DataState.Loading && <p>Loading...</p> }
        { error !== '' && <p>{error}</p> }
        { dataState === DataState.Error && <p>Something went wrong</p> }
      </div>
    </div>
  )
}