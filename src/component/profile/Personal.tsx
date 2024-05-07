import { useState } from "react";
import { User } from "../../typedef";
import { invoke } from "@tauri-apps/api";
import { useNavigate } from "react-router-dom";

interface PersonalProps { user: User, logout: () => void }
export default function Personal({ user, logout }: PersonalProps) {
  const nav = useNavigate();

  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  enum UIState { Rest, Edit, Confirm, Loading }
  const [state, setState] = useState<UIState>(UIState.Rest);
  const [error, setError] = useState<string>('');

  const [username, setUsername] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email ?? '');
  const [curPass, setCurPass] = useState<string>(user.email ?? '');
  const [newPass, setNewPass] = useState<string>('');
  const [newPass2, setNewPass2] = useState<string>('');

  const reset = () => {
    setConfirmDelete(false);
    setState(UIState.Rest);
    setCurPass('');
  }

  const saveChanges = async () => {
    if (newPass !== newPass2) { setError('Passwords do not match'); return; }

    setState(UIState.Loading);

    const data = {
      name: username ?? user.name,
      password: curPass ?? '',
      email: email ?? user.email,
      newPass: newPass ?? '',
    }

    // update user info
    console.log(data);
  }

  const deleteUser = async () => {
    
    console.log('Deleting user now...');
    await invoke('remove_user', { pw: curPass })
      .then((resp) => {
        console.log('resp came in: ', resp);
        if (resp as boolean === false) { setError('Error deleting user'); return }
        logout();
        nav('/');
      })
      .catch((e) => setError(e))
  }

  return (
    <main>

      <menu className='flex flex-col w-2/3 m-2 p-2'>

        <label className='text-sm' htmlFor='user'>Username</label>
        <input id='user' type='text' value={username} onChange={(e) => setUsername(e.target.value)} />

        <label className='text-sm' htmlFor='email'>Email</label>
        <input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
        

        <label className='text-sm' htmlFor='new-pass'>New Password</label>
        <input id='new-pass' type='password' value={newPass} onChange={(e) => setNewPass(e.target.value)} />

        <label className='text-sm' htmlFor='new-pass2'>Confirm Password</label>
        <input id='new-pass2' type='password' value={newPass2} onChange={(e) => setNewPass2(e.target.value)} />

        <button onClick={() => setState(UIState.Confirm)}>Save Changes</button>

        { error && <p>{error}</p> }

      </menu>

      <menu className='flex flex-col items-end w-2/3 m-2 p-2'>
        <button className='p-2 rounded-lg text-light2 bg-warn1 hover:opacity-80 w-32' onClick={() => { setConfirmDelete(true); setState(UIState.Confirm)}}>Delete User</button>
      </menu>

      { state === UIState.Confirm &&
        <menu>
          <label className='text-sm' htmlFor='pass'>Current Password</label>
          <input id='pass' type='password' value={curPass} onChange={(e) => setCurPass(e.target.value)} />

          <button onClick={() => {(confirmDelete ? deleteUser() : saveChanges()); reset();}} disabled={curPass === ''}>Confirm</button>
          <button onClick={() => {setState(UIState.Edit); setConfirmDelete(false); reset();}}>Cancel</button>
        </menu>
      }

    </main>
  )
}