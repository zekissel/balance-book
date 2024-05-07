import { useEffect, useState } from "react";

import { User } from "../../typedef";
import { useSecureStorage } from "../../stronghold";

interface FinancialProps { user: User }
export default function Financial({ user }: FinancialProps) {

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
  

  return (
    <div>

      <menu className='flex flex-col w-2/3 m-2 p-2'>
        
        <label htmlFor='plaid-client-id'>Plaid Client ID:</label>
        <input id='plaid-client-id' type='text' value={plaidClientID} onChange={(e) => setPlaidClientID(e.target.value)} />

        <label htmlFor='plaid-secret'>Plaid Secret:</label>
        <input id='plaid-secret' type='text' value={plaidSecret} onChange={(e) => setPlaidSecret(e.target.value)} />

        <button onClick={() => savePlaidInfo()}>Update Plaid Info</button>
      </menu>

      <menu>
        current bank connections and their availability
      </menu>

    </div>
  )
}