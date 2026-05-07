import { Link } from "react-router";
import { getUsers, User } from "../typedef";
import { useState, useEffect } from "react";

interface LoginProps { }
export default function Login ({}: LoginProps) {

  const [profiles, setProfiles] = useState<User[]>([]);
  useEffect(() => {
    const fetchProfiles = async () => { setProfiles(await getUsers()) }
    fetchProfiles();
  }, []);

  return (
    <div className="login-page">
      <div className="top-buttons">
        <button className="top-button plaid-button"><Link to='/plaid'><img src='/settings.svg' alt="Enter Plaid credentials" /></Link></button>
        <button className="top-button help-button"><img src='/q.svg' alt="External link to source code" /></button>
      </div>
      <h1>Select Profile</h1>
      <ul>
        {  profiles.map(profile => (
          <li key={profile.id}><Link to={`/profile/${profile.id}`}>{ profile.name }</Link></li>
        )) }
        <li><Link to='/register'>+</Link></li>
      </ul>
    </div>
  )
}