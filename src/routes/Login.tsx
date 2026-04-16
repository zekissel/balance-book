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
    <ul>
      {  profiles.map(profile => (
        <li key={profile.id}><Link to={`/profile/${profile.id}`}>{ profile.name }</Link></li>
      )) }
      <li><Link to='/register'>+</Link></li>
    </ul>
  )
}