import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User } from "../typedef";

interface RegisterProps { }
export default function Register ({}: RegisterProps) {

  const [name, setName] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const saveProfile = async () => {
    if (name === '') return;

    await invoke("create_user", { name })
      .then((user) => navigate("/profile/" + (user as User).id))
      .catch((e) => { {
        console.error("Error creating user:", e);
        setError(e);
      }});
    
  }

  return (
    <div>
      <input type="text" placeholder="Profile name" value={name} onChange={(e) => setName(e.target.value)} />

      <button onClick={saveProfile}>Save</button>
      <Link to='/login'>Cancel</Link>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}