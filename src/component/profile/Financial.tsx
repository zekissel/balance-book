import { useEffect, useState } from "react";

import { User } from "../../typedef";
import { useSecureStorage } from "../../stronghold";
import { useNavigate } from "react-router-dom";

interface FinancialProps { user: User }
export default function Financial({ user }: FinancialProps) {

  const nav = useNavigate();
  const { save, load } = useSecureStorage(user.id);

  const [plaidClientID, setPlaidClientID] = useState<string>('');
  const [plaidSecret, setPlaidSecret] = useState<string>('');

  useEffect(() => {
    const loadPlaidInfo = async () => {
      await load('plaid-client-id', 'temp-pw').then(id => setPlaidClientID(id))
        .catch(() => console.log('No plaid client id found'));
      await load('plaid-secret', 'temp-pw').then(secret => setPlaidSecret(secret))
        .catch(() => console.log('No plaid secret found'));
    }

    loadPlaidInfo();
  }, []);

  const savePlaidInfo = async () => {
    await save('plaid-client-id', plaidClientID, 'temp-pw');
    await save('plaid-secret', plaidSecret, 'temp-pw');
  }
  
  const isDisabled = () => {
    return plaidClientID === '' || plaidSecret === '';
  }

  return (
    <div>

      <menu className='flex flex-col w-2/3 m-2 p-2 bg-panel rounded-lg '>
        
        <label className='text-sm ' htmlFor='plaid-client-id'>Plaid Client ID:</label>
        <input id='plaid-client-id' type='text' value={plaidClientID} onChange={(e) => setPlaidClientID(e.target.value)} />

        <label className='text-sm ' htmlFor='plaid-secret'>Plaid Secret:</label>
        <input id='plaid-secret' type='text' value={plaidSecret} onChange={(e) => setPlaidSecret(e.target.value)} />

        <span className='w-full flex flex-row justify-between '>
          <button className={'text-white w-fit px-2 rounded-lg mx-auto mt-2 ' + (isDisabled() ? 'bg-bbgray1 ' : 'bg-neutral1 hover:opacity-80 ')} onClick={() => savePlaidInfo()}>Update Plaid Info</button>
          <button className={'rounded-xl px-1 mt-2 hover:opacity-75 ' + (isDisabled() ? 'bg-neutral4 ' : ' ')} onClick={isDisabled() ? (() => nav(0)) : undefined} ><img src='/misc/refresh.svg' alt='refresh' /></button>
        </span>
      </menu>

      <menu className='flex flex-col w-2/3 m-2 p-2 bg-panel rounded-lg '>

        <button className={'text-white w-fit px-2 rounded-lg mx-auto mt-2 ' + (isDisabled() ? 'bg-bbgray1 ' : 'bg-neutral1 hover:opacity-80 ')} onClick={isDisabled() ? () => {} :undefined}>Link Bank Account</button>

      </menu>

      <ol className='flex flex-col w-2/3 m-2 p-2 bg-panel rounded-lg '>

        <li>connected accounts </li>

      </ol>

    </div>
  )
}