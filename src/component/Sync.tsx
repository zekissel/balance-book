import { useState, useEffect, useMemo } from 'react';
import { User } from '../typedef';
import { invoke } from '@tauri-apps/api/core';
import { PlaidKey } from './profile/Link';

interface SyncProps { user: User }
export default function Sync({ user }: SyncProps) {

  //const [retry, setRetry] = useState<number>(0);
  const [pID, setPID] = useState<string>('');
  const [pSecret, setPSecret] = useState<string>('');

  const plaidKey = useMemo(() => {
    return new Object({ client_id: pID, secret: pSecret }) as PlaidKey;
  }, [pID, pSecret]);

  useEffect(() => {
    const loadPlaidInfo = async () => {
      setPID(localStorage.getItem('plaid-client-id') || '');
      setPSecret(localStorage.getItem('plaid-secret') || '');
    }
    loadPlaidInfo();
    //if (retry <= 5) loadPlaidInfo();
  }, [/*retry*/]);

  useEffect(() => {
    const sync = async () => {
      await invoke('sync_info', { userId: user.id, key: plaidKey })
        .then((_data) => {
          /* differentiate recently sync'd transactions */
          const recent = _data as string[];
          sessionStorage.setItem('recent', recent.join('&'));
        })
    }

    const syncDate = localStorage.getItem(`${user.id.slice(0, 8)}.sync`);
		const allowSync = syncDate ? addHours(new Date(syncDate), 6) < new Date(new Date().toISOString().split('.')[0]) : true;

    if (pID !== '' && pSecret !== '' && allowSync) {
      sync();
      localStorage.setItem(`${user.id.slice(0, 8)}.sync`, new Date().toISOString().split('.')[0]);
    }
  }, [pID, pSecret]);

  return (
    <>
    </>
  );
}

export function addHours(date: Date, hours: number) {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		date.getHours() + hours,
		0, 0, 0,
	);
}