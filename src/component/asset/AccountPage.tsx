import { useState, useMemo } from "react";
import { Account } from "../../typedef";
import '../../styles/AccountPage.css';
import { EditAccount } from "./EditAccount";

interface AccountPageProps { accounts: Account[], updateAccounts: () => void }
export default function AccountPage ({ accounts, updateAccounts }: AccountPageProps) {

  const uniqueAccounts = useMemo(() => {
    const ids = Array.from(new Set(accounts.map(a => a.account_id)));
    return ids.map(id => accounts.find(a => a.account_id === id) as Account);
  }, [accounts]);

  const [showEdit, setShowEdit] = useState<number[]>([]);
  const toggleEdit = (index: number) => {
    if (showEdit.includes(index)) setShowEdit(showEdit.filter(i => i !== index));
    else setShowEdit([...showEdit, index]);
  }

  return (
    <div className='assets-main'>

      <ul className='assets-main-list'>
        { uniqueAccounts.map((a, i) => {
          return (
            <li key={i}>
              <div className='assets-account-card'>
                

                <div>
                  { showEdit.includes(i) && <EditAccount log={a} type={a.account_type} toggle={() => toggleEdit(i)} cancel={() => toggleEdit(i)} updateAccounts={updateAccounts} /> }
                  { !showEdit.includes(i) &&
                    <>
                      <button onClick={() => toggleEdit(i)}><img src='/edit.svg'/></button>
                      <h4>{ a.account_id }</h4>
                      <i>{ a.account_type }</i>
                      <p>${ a.balance / 100 }</p>
                    </>
                  }
                  
                </div>
                <div>
                  
                </div>
              </div>
            </li>
          )
        })}
        { accounts.length === 0 && <li>No accounts found</li> }
      </ul>

    </div>
  );
}