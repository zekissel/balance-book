import { User } from '../../typedef';
import { useEffect, useState, useMemo } from 'react';
import PlaidLink from './PlaidLink';
import { invoke } from '@tauri-apps/api';
import { addHours } from '../../typeassist';

interface ProfileLinkProps {
	user: User;
	refreshAcct: () => void;
	refreshTrans: () => void;
}
export default function ProfileLink({ user, refreshAcct, refreshTrans }: ProfileLinkProps) {
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

	return (
		<div className="profile-financial">

			<div className='profile-card'>
				<menu>
					<h3>Connect Financial Institution with Plaid</h3>
					<button onClick={() => setShowLink(!showLink)}>
						{showLink ? 'Close' : 'Start Link Process'}
					</button>
					{showLink && <PlaidLink user={user} refreshAcct={refreshAcct} refreshTrans={refreshTrans} />}

					<p>Requires creating an account with <a href='https://plaid.com/' target='_blank' rel="noopener noreferrer">Plaid</a>, and applying for deployment access (production access after June 2024)</p>
				</menu>
			</div>

			<div className='generic-card'>

				<div className='heading-items'>
					<h3>Institution Status</h3>

					<span>Last refresh: { lastUpdate }</span>

					<button onClick={async () => await fetchAndLog()}>Refresh</button>
				</div>

				<div className='item-organizer'>
				{ status.map((s, i) => (
					<div key={i}>
						<p>{s.name}</p>
						<p>Last updated: {s.last_update}</p>
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
