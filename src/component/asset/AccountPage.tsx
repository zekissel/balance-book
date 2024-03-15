import { useMemo } from "react";
import { Account } from "../../typedef";
import '../../styles/AccountPage.css';

interface AccountPageProps { accounts: Account[] }
export default function AccountPage ({ accounts }: AccountPageProps) {

  const uniqueAccounts = useMemo(() => {
    const ids =  accounts.map(a => a.account_id).filter((v, i, a) => a.indexOf(v) === i);
    return ids.map(id => accounts.find(a => a.account_id === id) as Account);
  }, [accounts]);

  return (
    <div className='assets-main'>

      <h3>Checking Accounts</h3>

      <ul>
        { uniqueAccounts.map((a, i) => {
          return (
            <li key={i}>
              <div>
                <h4>{a.account_id}</h4>
                <p>${a.balance / 100}</p>
              </div>
            </li>
          )
        })}
        { accounts.length === 0 && <li>No accounts found</li> }
      </ul>

    </div>
  );
}