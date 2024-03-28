import { User } from '../../typedef';
import PlaidLinkWithOAuth from './PlaidLinkWithOAuth';

interface ProfileLinkProps { user: User }
export default function ProfileLink ({ user }: ProfileLinkProps) {

  return (
    <div className='profile-financial'>
      <p>work in progress; connect bank account with plaid/link</p>
      <a href='about:blank' target='_blank' rel='noreferrer'>Plaid</a>
      <PlaidLinkWithOAuth user={user} />
    </div>
  )
}