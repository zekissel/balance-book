import { useState } from "react";

export default function ProfileLink () {

  const [test, setTest] = useState(window.location.href);
  const isOAuthRedirect = window.location.href; //.includes('?oauth_state_id=')

  return (
    <div className='profile-financial'>
      <p onClick={() => console.log(test)}>work in progress; connect bank account with plaid/link</p>
      <a href='about:blank' target='_blank' rel='noreferrer'>Plaid</a>
    </div>
  )
}