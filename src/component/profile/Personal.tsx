import { useState, useEffect } from "react";
import { removeFile, BaseDirectory } from '@tauri-apps/api/fs';
import { User } from "../../typedef";
import { invoke } from "@tauri-apps/api";
import { useNavigate } from "react-router-dom";

interface PersonalProps { user: User, setUser: (user: User) => void, logout: () => void }
export default function Personal({ user, setUser, logout }: PersonalProps) {
  const nav = useNavigate();

  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  enum UIState { Rest, Edit, Confirm, Loading }
  const [state, setState] = useState<UIState>(UIState.Rest);
  const [error, setError] = useState<string>('');

  const [username, setUsername] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email ?? '');
  const [curPass, setCurPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [newPass2, setNewPass2] = useState<string>('');

  const reset = () => {
    setConfirmDelete(false);
    setState(UIState.Rest);
    setCurPass('');
  }

  const conditionalConfirm = () => {
    if (newPass !== newPass2) setError('Passwords do not match');
    else setState(UIState.Confirm);
  }

  const saveChanges = async () => {
    if (newPass !== newPass2) { setError('Passwords do not match'); return; }

    setState(UIState.Loading);

    const data = {
      name: username !== user.name ? username : undefined,
      password: curPass ?? '',
      email: email !== user.email ? email : undefined,
      newPass: newPass !== '' ? newPass : undefined,
    }

    await invoke('fix_user', data)
      .then((resp) => {
        setUser(resp as User);
        setError('Updated user info')
      })
      .catch((e) => setError(e))
  }

  const deleteUser = async () => {
    
    await invoke('remove_user', { pw: curPass })
      .then((resp) => {
        if (resp as boolean === false) { setError('Error deleting user'); return }
        removeVault();
        logout();
        nav('/');
      })
      .catch((e) => setError(e))
  }

  const removeVault = async () => {
    await removeFile(`vaults/vault.${user.id.slice(0, 8)}`, { dir: BaseDirectory.AppData });
  }

  const isDisabled = () => {
    return username === user.name && email === user.email && newPass === '' && newPass2 === '';
  }

  useEffect(() => {
    if (error !== '') setTimeout(() => setError(''), 5000);
  }, [error]);

  return (
    <main>

      <menu className='flex flex-col w-2/3 m-2 p-2 bg-panel rounded-lg '>

        <label className='text-sm' htmlFor='user'>Username</label>
        <input id='user' type='text' value={username} placeholder='Username' onChange={(e) => setUsername(e.target.value)} />

        <label className='text-sm' htmlFor='email'>Recovery Email</label>
        <input id='email' type='email' value={email} placeholder='not implemented' onChange={(e) => setEmail(e.target.value)} />
        

        <label className='text-sm mt-4 ' htmlFor='new-pass'>New Password</label>
        <input id='new-pass' type='password' value={newPass} onChange={(e) => setNewPass(e.target.value)} />

        <label className='text-sm' htmlFor='new-pass2'>Confirm Password</label>
        <input id='new-pass2' type='password' value={newPass2} onChange={(e) => setNewPass2(e.target.value)} />

        <button className={'text-white w-fit px-2 rounded-lg mx-auto mt-2 ' + (isDisabled() ? 'bg-bbgray1 ' : 'bg-neutral1 hover:opacity-80 ')} onClick={conditionalConfirm} disabled={isDisabled()} >Save Changes</button>

        { error && <p>{error}</p> }

      </menu>

      <menu className='flex flex-col items-end w-2/3 m-2 p-2 bg-panel rounded-lg'>
        <button className='p-2 rounded-lg text-light2 bg-warn1 hover:opacity-80 w-32' onClick={() => { setConfirmDelete(true); setState(UIState.Confirm)}}>Delete User</button>
      </menu>

      { state === UIState.Confirm &&
        <menu className='absolute h-full w-full top-0 left-0 bg-dim flex flex-col items-center justify-center '>
          { confirmDelete ? <em className='text-white text-lg text-center '>Are you sure you want you to delete your user and all associated accounts/transactions/Plaid keys?</em> : <em className='text-white text-lg text-center '>Enter current password to save changes to user</em> }

          <label className='text-sm text-white ' htmlFor='pass'>Current Password</label>
          <input id='pass' type='password' value={curPass} onChange={(e) => setCurPass(e.target.value)} />

          <button className={'rounded-lg mt-2 text-white p-2 hover:opacity-80 ' + (confirmDelete ? 'bg-warn1 ' : 'bg-neutral1 ')} onClick={() => {(confirmDelete ? deleteUser() : saveChanges()); reset();}} disabled={curPass === ''}>Confirm</button>
          <button className='bg-bbgray1 rounded-lg mt-2 text-white p-1 hover:opacity-80 ' onClick={() => {setState(UIState.Edit); setConfirmDelete(false); reset();}}>Cancel</button>
        </menu>
      }

    </main>
  )
}