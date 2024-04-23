import { User } from '../../typedef';
import { useEffect, useState } from 'react';
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

	interface InstStatus {
		name: string;
		last_update: string;
		status: string;
	}

	const [status, setStatus] = useState<InstStatus[]>(localStorage.getItem(`${user.uname}.inst.status`) !== null ? (localStorage.getItem(`${user.uname}.inst.status`))!.split('%').map(i => new Object({ name: i.split('?')[0], last_update: i.split('?')[1], status: i.split('?')[2] }) as InstStatus) : []);

	useEffect(() => {

		const syncStatus = localStorage.getItem(`${user.uname}.sync.s.date`);
			const sync = syncStatus
				? addHours(new Date(syncStatus), 6) < new Date(new Date().toISOString().split('.')[0])
				: true;

		const fetchStatus = async () => {
			await invoke('get_status', { userId: user.id })
				.then((res) => {
					const stat = res as InstStatus[];
					setStatus(stat);
					const store = stat.map(s => `${s.name}?${s.last_update}?${s.status}`).join('%');
					localStorage.setItem(`${user.uname}.inst.status`, store);
				})
				//.catch(_ => setStatus([]));
		};
		if (sync) {
			fetchStatus();
			localStorage.setItem(`${user.uname}.sync.s.date`, new Date().toISOString().split('.')[0]);
		}

	}, []);


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

			<div className='profile-card'>

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
	);
}
