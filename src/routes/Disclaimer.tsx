import { Link } from "react-router";

interface DisclaimerProps {

}
export default function Disclaimer ({}: DisclaimerProps) {


  return (
    <div>
      <h2>Disclaimer Component</h2>
      <p>This is the disclaimer page.</p>

      <Link to={localStorage.getItem('plaid_id') && localStorage.getItem('plaid_key') ? '/login' : '/plaid'}>Continue</Link>
      <button>?</button>
    </div>
  )
}