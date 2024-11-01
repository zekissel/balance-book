import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { User } from "../../typedef";

import PlaidLink, { PlaidKey } from "./Link";
import { addHours } from "../Sync";

interface FinancialProps { user: User }
export default function Financial({ user }: FinancialProps) {

  //const { save, load } = useSecureStorage(user.id, 'rw');

  const [startLink, setStartLink] = useState<boolean>(sessionStorage.getItem('start-link') === 'true');
  const toggleStartLink = () => { 
    setStartLink(!startLink); 
    if (!startLink) sessionStorage.setItem('start-link', 'true')
    else sessionStorage.removeItem('start-link');
  };

  const [plaidClientID, setPlaidClientID] = useState<string>('');
  const [plaidSecret, setPlaidSecret] = useState<string>('');

  //const [retry, setRetry] = useState<number>(0);
  const plaidKey = useMemo(() => {
    return new Object({ client_id: plaidClientID, secret: plaidSecret }) as PlaidKey;
  }, [plaidClientID, plaidSecret]);

  useEffect(() => {
    const loadPlaidInfo = async () => {
      setPlaidClientID(localStorage.getItem('plaid-client-id') || '');
      setPlaidSecret(localStorage.getItem('plaid-secret') || '');
    }

    loadPlaidInfo();

    return () => {
      sessionStorage.removeItem('start-link');
    }
  }, []);

  const savePlaidInfo = async () => {
    localStorage.setItem('plaid-client-id', plaidClientID);
    localStorage.setItem('plaid-secret', plaidSecret);
  }
  
  const isDisabled = () => {
    return plaidClientID === '' || plaidSecret === '';
  }

  const [hideID, setHideID] = useState<boolean>(true);
  const toggleHideID = () => setHideID(!hideID);
  const [hideSecret, setHideSecret] = useState<boolean>(true);
  const toggleHideSecret = () => setHideSecret(!hideSecret);

  return (
    <div>

      <menu className='flex flex-col w-2/3 m-2 p-2 bg-panel rounded-lg '>
        
        <label className='text-sm ml-[calc(10%)] ' htmlFor='plaid-client-id'>Plaid Client ID:</label>
        <span className='flex flex-row ml-[calc(10%)] '>
          <input className='w-5/6 ' id='plaid-client-id' type={hideID ? 'password' : 'text'} value={plaidClientID} onChange={(e) => setPlaidClientID(e.target.value)} />
          <label htmlFor='plaid-client-id' onClick={toggleHideID}><img src={'/misc/' + (hideID ? 'hide' : 'show') + '.svg'} /></label>
        </span>

        <label className='text-sm ml-[calc(10%)] ' htmlFor='plaid-secret'>Plaid Secret:</label>
        <span className='flex flex-row ml-[calc(10%)] '>
          <input className='w-5/6 ' id='plaid-secret' type={hideSecret ? 'password' : 'text'} value={plaidSecret} onChange={(e) => setPlaidSecret(e.target.value)} />
          <label htmlFor='plaid-secret' onClick={toggleHideSecret}><img src={'/misc/' + (hideSecret ? 'hide' : 'show') + '.svg'} /></label>
        </span>

        <span className='w-full flex flex-row justify-between '>
          <button className={'text-white w-fit px-2 rounded-lg mx-auto mt-2 ' + (isDisabled() ? 'bg-bbgray1 ' : 'bg-neutral1 hover:opacity-80 ')} onClick={() => savePlaidInfo()}>Update Plaid Info</button>
        </span>

      </menu>

      <menu className='flex flex-col w-2/3 m-2 my-8 p-2 bg-panel rounded-lg '>

        <button className={'text-white text-lg w-fit px-2 rounded-lg mx-auto mt-2 ' + (isDisabled() ? 'bg-bbgray1 ' : 'bg-primary hover:opacity-80 ')} onClick={isDisabled() ? undefined : toggleStartLink}>Link Bank Account</button>

        { !isDisabled() && startLink && <PlaidLink user={user} pKey={plaidKey} /> }

      </menu>

      { !isDisabled() && <InstitutionInfo user={user} plaidKey={plaidKey} /> }

    </div>
  )
}

interface StatusProps { user: User, plaidKey: PlaidKey }
function InstitutionInfo ({ user, plaidKey }: StatusProps) {

  interface InstitutionStatus {
		name: string;
		last_update: string;
		status: string;
	}


  const [newStatus, setNewStatus] = useState(false);
	const toggleNewStatus = () => setNewStatus(!newStatus);

  const fetchStatus = async () => {
		await invoke('get_status', { userId: user.id, key: plaidKey })
			.then((res) => {
				const stat = res as InstitutionStatus[];
				setStatus(stat);
				const store = stat.map(s => `${s.name}?${s.last_update}?${s.status}`).join('%');
				localStorage.setItem(`${user.id.slice(0, 8)}.fin.inst.status`, store);
			})
			.finally(() => toggleNewStatus());
		
	};

  const fetchAndLog = async () => {
		await fetchStatus();
		localStorage.setItem(`${user.id.slice(0, 8)}.sync.fin.inst.status`, new Date().toISOString().split('.')[0]);
	}

  const [status, setStatus] = useState<InstitutionStatus[]>(localStorage.getItem(`${user.id.slice(0, 8)}.fin.inst.status`) !== null ? (localStorage.getItem(`${user.id.slice(0, 8)}.fin.inst.status`))!.split('%').map(i => new Object({ 
      name: i.split('?')[0], 
      last_update: i.split('?')[1], 
      status: i.split('?')[2] 
    }) as InstitutionStatus) : []);

  useEffect(() => {
		const syncStatus = localStorage.getItem(`${user.id.slice(0, 8)}.sync.fin.inst.status`);
			const sync = syncStatus
				? addHours(new Date(syncStatus), 6) < new Date(new Date().toISOString().split('.')[0])
				: true;
		
		if (sync) fetchAndLog();
	}, []);

	const lastUpdate = useMemo(() => {
		return localStorage.getItem(`${user.id.slice(0, 8)}.sync.fin.inst.status`);
	}, [newStatus]);

  return (
    <ol className='flex flex-col w-2/3 h-[calc(50vh)] m-2 p-2 bg-panel rounded-lg '>

      <menu className='flex flex-row justify-between '>
        <span>Num. financial items: { status.length }</span>

        <span className='text-right '>Recent refresh: { lastUpdate }<br/>
          <button className={'rounded-xl px-1 hover:opacity-65 '} onClick={async () => await fetchAndLog()}>
            <img src='/misc/refresh.svg' alt='refresh' />
          </button>
        </span>
      </menu>

      <div className='w-full grid grid-cols-2 h-full overflow-hidden overflow-y-scroll '>
        { status.map((s, i) => (
            <div key={i} className='bg-light1 w-fit h-fit p-1 rounded-lg text-center justify-self-center '>
              <p className='font-semibold '>{s.name}</p>
              <p>Status: {s.status}</p>
              <p>Last successful sync: <br/>{ s.last_update }</p>
            </div>
        )) }
      </div>

    </ol>
  )
}