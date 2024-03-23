

export default function ProfileLink () {

  const isOAuthRedirect = window.location.href.includes('?oauth_state_id=');

  return (
    <div className='profile-financial'>
      <p onClick={() => console.log(isOAuthRedirect)}>work in progress; connect bank account with plaid/link</p>
      <a href='https://plaid.com/' target='_blank' rel='noreferrer'>Plaid</a>
    </div>
  )
}