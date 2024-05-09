import { useEffect, useMemo, useState } from "react";

import { User } from "../../typedef";
import { useSecureStorage } from "../../stronghold";
import { useNavigate } from "react-router-dom";
import PlaidLink, { PlaidKey } from "./Link";

interface FinancialProps { user: User }
export default function Financial({ user }: FinancialProps) {

  const nav = useNavigate();
  const { save, load } = useSecureStorage(user.id);

  const [startLink, setStartLink] = useState<boolean>(false);
  const toggleStartLink = () => setStartLink(!startLink);

  const [plaidClientID, setPlaidClientID] = useState<string>('');
  const [plaidSecret, setPlaidSecret] = useState<string>('');

  const [retry, setRetry] = useState<number>(0);
  const plaidKey = useMemo(() => {
    return new Object({ client_id: plaidClientID, secret: plaidSecret }) as PlaidKey;
  }, [plaidClientID, plaidSecret]);

  useEffect(() => {
    const loadPlaidInfo = async () => {
      await load('plaid-client-id', user.id).then(id => {if (id !== '') setPlaidClientID(id)})
        .catch(() => setRetry(retry + 1));
      await load('plaid-secret', user.id).then(secret => {if (secret !== '') setPlaidSecret(secret)})
        .catch(() => setRetry(retry + 1));
    }

    loadPlaidInfo();
  }, [retry]);

  const savePlaidInfo = async () => {
    await save('plaid-client-id', plaidClientID, user.id);
    await save('plaid-secret', plaidSecret, user.id);
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

      <menu className='flex flex-col w-2/3 m-2 my-8 p-2 bg-panel rounded-lg '>

        <button className={'text-white text-lg w-fit px-2 rounded-lg mx-auto mt-2 ' + (isDisabled() ? 'bg-bbgray1 ' : 'bg-primary hover:opacity-80 ')} onClick={isDisabled() ? undefined : toggleStartLink}>Link Bank Account</button>

        { startLink && <PlaidLink user={user} pKey={plaidKey} /> }

      </menu>

      <InstitutionInfo />

    </div>
  )
}


function InstitutionInfo () {

  return (
    <ol className='flex flex-col w-2/3 m-2 p-2 bg-panel rounded-lg '>

      <li>connected accounts </li>

    </ol>
  )
}