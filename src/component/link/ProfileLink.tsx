import { User } from '../../typedef';
import { useState } from 'react';
import PlaidLink from './PlaidLink';

interface ProfileLinkProps { user: User, refreshAcct: () => void, refreshTrans: () => void }
export default function ProfileLink ({ user, refreshAcct, refreshTrans }: ProfileLinkProps) {

  const [showLink, setShowLink] = useState(localStorage.getItem('auth_state') !== null);

  return (
    <div className='profile-financial'>
      <p>work in progress; connect bank account with plaid/link</p>
      <button onClick={() => setShowLink(!showLink)}>{ showLink ? 'Close' : 'Start Link Process' }</button>
      { showLink && <PlaidLink user={user} refreshAcct={refreshAcct} refreshTrans={refreshTrans} />}
    </div>
  )
}