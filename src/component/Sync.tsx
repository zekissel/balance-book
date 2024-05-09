import { useState, useEffect, useMemo } from 'react';
import { useSecureStorage } from '../stronghold';
import { User } from '../typedef';
import { invoke } from '@tauri-apps/api';
import { PlaidKey } from './profile/Link';

interface SyncProps { user: User }
export default function Sync({ user }: SyncProps) {


  const { save, load } = useSecureStorage(user.id);

  const [retry, setRetry] = useState<number>(0);
  const [pID, setPID] = useState<string>('');
  const [pSecret, setPSecret] = useState<string>('');

  const plaidKey = useMemo(() => {
    return new Object({ client_id: pID, secret: pSecret }) as PlaidKey;
  }, [pID, pSecret]);

  useEffect(() => {
    const loadPlaidInfo = async () => {
      await load('plaid-client-id', user.id).then(id => {if (id !== '') setPID(id)})
        .catch(() => setRetry(retry + 1));
      await load('plaid-secret', user.id).then(secret => {if (secret !== '') setPSecret(secret)})
        .catch(() => setRetry(retry + 1));
    }

    loadPlaidInfo();
  }, [retry]);

  useEffect(() => {
    const sync = async () => {
      await invoke('sync_info', { userId: user.id, key: plaidKey })
        .then((data) => {
          /* differentiate recently sync'd transactions */
          const recent = data as string[];
          //setUpdated(recent);
        })
    }

    const syncDate = localStorage.getItem(`${user.id}.sync`);
		const allowSync = syncDate ? addHours(new Date(syncDate), 6) < new Date(new Date().toISOString().split('.')[0]) : true;

    if (pID !== '' && pSecret !== '' && allowSync) {
      sync();
      localStorage.setItem(`${user.id}.sync`, new Date().toISOString().split('.')[0]);
    }
  }, [pID, pSecret]);

  return (
    <>
    </>
  );
}

function addHours(date: Date, hours: number) {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		date.getHours() + hours,
		0, 0, 0,
	);
}