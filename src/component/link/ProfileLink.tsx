import { User } from '../../typedef';
import { useEffect, useState, useMemo } from 'react';
import PlaidLink from './PlaidLink';
import { invoke } from '@tauri-apps/api';
import { addHours } from '../../typeassist';

interface ProfileLinkProps {
	user: User;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	refreshAcct: () => void;
	refreshTrans: () => void;
}
export default function ProfileLink({ user, setUser, refreshAcct, refreshTrans }: ProfileLinkProps) {
	const [showLink, setShowLink] = useState(localStorage.getItem('auth_state') !== null);

	interface InstitutionStatus {
		name: string;
		last_update: string;
		status: string;
	}

	const [newStatus, setNewStatus] = useState(false);
	const toggleNewStatus = () => setNewStatus(!newStatus);

	const fetchStatus = async () => {
		await invoke('get_status', { userId: user.id })
			.then((res) => {
				const stat = res as InstitutionStatus[];
				setStatus(stat);
				const store = stat.map(s => `${s.name}?${s.last_update}?${s.status}`).join('%');
				localStorage.setItem(`${user.uname}.inst.status`, store);
			})
			.finally(() => toggleNewStatus());
		
	};

	const fetchAndLog = async () => {
		await fetchStatus();
		localStorage.setItem(`${user.uname}.sync.s.date`, new Date().toISOString().split('.')[0]);
	}

	const [status, setStatus] = useState<InstitutionStatus[]>(localStorage.getItem(`${user.uname}.inst.status`) !== null ? (localStorage.getItem(`${user.uname}.inst.status`))!.split('%').map(i => new Object({ name: i.split('?')[0], last_update: i.split('?')[1], status: i.split('?')[2] }) as InstitutionStatus) : []);

	useEffect(() => {
		const syncStatus = localStorage.getItem(`${user.uname}.sync.s.date`);
			const sync = syncStatus
				? addHours(new Date(syncStatus), 6) < new Date(new Date().toISOString().split('.')[0])
				: true;
		
		if (sync) fetchAndLog();
	}, []);

	const lastUpdate = useMemo(() => {
		return localStorage.getItem(`${user.uname}.sync.s.date`);
	}, [newStatus]);


	const [error, setError] = useState('');
	const [linkNotSet, setLinkSet] = useState(!user.plaid_id || !user.plaid_secret);
	const [clientId, setClientId] = useState(user.plaid_id ?? '');
	const [secret, setSecret] = useState(user.plaid_secret ?? '');

	const [showID, setShowID] = useState(false);
	const toggleShowID = () => setShowID(!showID);
	const [showSecret, setShowSecret] = useState(false);
	const toggleShowSecret = () => setShowSecret(!showSecret);

	const updateLink = async () => {
		await invoke('update_user_link', { id: user.id, clientId, secret })
			.then((resp) => {
				if (resp === null) { setError('Error updating Plaid information'); return}
				const user = resp as User;
				setUser(user);
				setClientId(user.plaid_id ?? '');
				setSecret(user.plaid_secret ?? '');
				if (user.plaid_id && user.plaid_secret) setLinkSet(false);
			})
			.catch(() => setError('Error updating Plaid information'));
	};

	return (
		<div className="profile-financial">

			<div className='profile-card'>
				<menu>
					<h3>Connect Financial Institution with Plaid</h3>
					<button onClick={() => setShowLink(!showLink)} disabled={linkNotSet}>
						{showLink ? 'Close' : 'Start Link Process'}
					</button>
					{showLink && <PlaidLink user={user} refreshAcct={refreshAcct} refreshTrans={refreshTrans} />}

					<p>Requires creating an account with <a id='plaid-url' href='https://plaid.com/' target='_blank' rel="noopener noreferrer">Plaid</a>, and applying for deployment access (production access after June 2024)</p>

					<span>
					<input id='pID' type={showID? 'text' : 'password'} placeholder='Plaid Client ID' value={clientId} onChange={(e) => setClientId(e.target.value)} /><label htmlFor='pID' onClick={toggleShowID}><img src={showID?'/hide.svg': '/show.svg'} /></label></span>
					<span><input id='pSec' type={showSecret? 'text' : 'password'} placeholder='Plaid Environment Secret (Development)' value={secret} onChange={(e) => setSecret(e.target.value)} /><label htmlFor='pSec' onClick={toggleShowSecret}><img src={showSecret?'/hide.svg': '/show.svg'} /></label></span>
					<button onClick={updateLink}>Update Plaid Info</button>

					{ error !== '' && <p>{error}</p> }
				</menu>
			</div>

			<div className='generic-card'>

				<div className='heading-items'>
					<h3>Institution Status</h3>

					<span>Last refresh: { lastUpdate }</span>

					<button onClick={async () => await fetchAndLog()}><img src='/refresh.svg'/></button>
				</div>

				<div className='item-organizer'>
				{ status.map((s, i) => (
					<div key={i}>
						<p>{s.name}</p>
						<p>Last successful sync: <br/>{s.last_update}</p>
						<p>Status: {s.status}</p>
					</div>
				)) }

				{
					status.length === 0 && <p>Connected institutions will appear here</p>
				}
				</div>
			</div>
			
		</div>
	);
}
