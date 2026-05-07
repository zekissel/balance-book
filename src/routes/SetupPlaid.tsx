import { useState } from "react";
import { useNavigate } from "react-router";

interface SetupPlaidProps {

}
export default function SetupPlaid ({}: SetupPlaidProps) {

  const [pID, setPId] = useState(localStorage.getItem('plaid_id') ?? '');
  const [pKey, setPKey] = useState(localStorage.getItem('plaid_key') ?? '');

  const nav = useNavigate();
  const saveCreds = () => {
    localStorage.setItem("plaid_id", pID);
    localStorage.setItem("plaid_key", pKey);

    nav("/login");    
  }

  return (
    <div className="setup-plaid-page">
      <div className="top-buttons">
        <button className="top-button help-button"><img src='/q.svg' /></button>
      </div>
      <h1>Setup Plaid</h1>
      <div className="setup-form">
        <input type="text" placeholder="Plaid ID" value={pID} onChange={(e) => setPId(e.target.value)} />
        <input type="text" placeholder="Plaid Key" value={pKey} onChange={(e) => setPKey(e.target.value)} />

        <button onClick={saveCreds}>Save</button>
      </div>
    </div>
  )
}