import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useNavigate } from 'react-router-dom';
import { BookError, User } from '../../typedef';
import FloatBG from './FloatBG';

interface AuthProps {
  verifyUser: (user: User) => void;
}
export default function Auth ({ verifyUser }: AuthProps) {

  const navigate = useNavigate();
  enum UIState { Login, Register }
  const [state, setState] = useState<UIState>(UIState.Login);
  const toggleState = () => {
    setState(state === UIState.Login ? UIState.Register : UIState.Login);
    clearPass();
  }
  const clearPass = () => {
    setPassword(''); setConfirm('');
  }

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');

  const [error, setError] = useState<string>('');
  useEffect(() => {
    if (error) setTimeout(() => setError(''), 5000);
  }, [error]);

  const submit = async () => {
    if (state === UIState.Register && password !== confirm) {
      setError('Passwords do not match');
    }

    const data = { name: username, pass: password }

    let response: User | BookError;
    let command = state === UIState.Register ? 'register_user' : 'verify_user';
    
    response = await invoke(command, data);
    console.log(response);

    clearPass();
    if (response && ('id' in response)) { verifyUser(response); navigate('/home'); }
    else if ('message' in response) setError(response.message);
  }

  return (
    <main className='w-screen h-screen flex flex-col justify-center items-center'>

      <menu 
        className='flex flex-col justify-center items-start border-primary border-2 border-solid rounded-2xl p-8 px-16 bg-panel absolute '
      >

        <label htmlFor='name'>Username</label>
        <input id='name' type='text' value={username} onChange={(e) => setUsername(e.target.value)} />

        <label htmlFor='pass'>Password</label>
        <input id='pass' type='password' value={password} onChange={(e) => {setPassword(e.target.value)}} />

        { state === UIState.Register && 
          <>
            <label htmlFor='confirm'>Confirm Password</label>
            <input id='confirm' type='password' value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </>
        }

        <span className='w-full flex flex-col items-center mt-4'>
          <button 
            className='w-full my-2 p-1 justify-self-center text-light2 font-semibold bg-primary hover:bg-highlight rounded-xl' 
            onClick={() => submit()}>{ state === UIState.Login ? 'Login' : 'Register' }
          </button>

          <button 
            className='w-5/6 my-2 p-1 justify-self-center bg-light1 hover:bg-light2 border-1 border-solid rounded-xl' 
            onClick={() => toggleState()}>{ state === UIState.Login ? 'Register' : 'Cancel' }
          </button>
        </span>

        { error && <em>{error}</em> }

      </menu>

      <FloatBG />

    </main>
  )
}