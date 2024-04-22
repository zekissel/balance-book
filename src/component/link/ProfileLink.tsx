import { User } from '../../typedef';
import { useState } from 'react';
import PlaidLink from './PlaidLink';

interface ProfileLinkProps {
	user: User;
	refreshAcct: () => void;
	refreshTrans: () => void;
}
export default function ProfileLink({ user, refreshAcct, refreshTrans }: ProfileLinkProps) {
	const [showLink, setShowLink] = useState(localStorage.getItem('auth_state') !== null);

	return (
		<div className="profile-financial">
			<h3>Connect Financial Institution with Plaid</h3>
			<button onClick={() => setShowLink(!showLink)}>
				{showLink ? 'Close' : 'Start Link Process'}
			</button>
			{showLink && <PlaidLink user={user} refreshAcct={refreshAcct} refreshTrans={refreshTrans} />}

			<p>Requires creating an account with <a href='https://plaid.com/' target='_blank' rel="noopener noreferrer">Plaid</a>, and applying for deployment access (production access after June 2024)</p>

			
		</div>
	);
}
