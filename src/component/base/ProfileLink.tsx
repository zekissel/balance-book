import { useRef, useMemo } from "react";

export default function ProfileLink () {

  const windowURL = useRef(window.location.href);
  const isOAuthRedirect = useMemo(() => windowURL.current.includes('?oauth_state_id='), [windowURL.current]);

  return (
    <div className='profile-financial'>
      <p onClick={() => console.log(windowURL.current, isOAuthRedirect)}>work in progress; connect bank account with plaid/link</p>
      <a href='about:blank' target='_blank' rel='noreferrer'>Plaid</a>
    </div>
  )
}