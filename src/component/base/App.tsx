import { useState, useEffect } from "react";
import { State, Transaction, Account, User } from "../../typedef";
import { getTransactions, getAccounts } from "../../typeassist";
import Nav from "../template/Nav";
import Home from "./Home";
import Activity from "./Activity";
import Stats from "./Stats";
import Assets from "./Assets";
import "../../styles/App.css";
import Profile from "./Profile";
import Auth from "./Auth";

function App() {

  const [user, setUser] = useState<User | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [signalAcct, setSignalAcct] = useState(false);
  const [signalTrans, setSignalTrans] = useState(false);
  
  const signalRefreshAcct = () => setSignalAcct(!signalAcct);
  const signalRefreshTrans = () => setSignalTrans(!signalTrans);
  const refreshAccounts = async () => { if (user) setAccounts(await getAccounts(user.id)) };
  const refreshTransactions = async () => { setTransactions(await getTransactions(accounts.map(a => a.id))) };
  useEffect(() => { refreshAccounts() }, [signalRefreshAcct, user]);
  useEffect(() => { refreshTransactions() }, [signalRefreshTrans, accounts])
  
  
  const [UIState, setUIState] = useState(State.Auth);
  const logout = () => { localStorage.removeItem('username'); setUser(null);  setUIState(State.Auth); }
  const verify = (user: User) => { 
    setUser(user); 
    setUIState(State.Home); 
    localStorage.setItem('username', user.uname); 
  }

  return (
    <div className='app'>
      <Nav state={UIState} setState={setUIState}/>

      { UIState === State.Auth && <Auth verify={verify} logout={logout} /> }

      { user !== null && 
        <main>
          { UIState === State.Home &&
            <Home user={user} accounts={accounts} transactions={transactions} />
          }

          { UIState === State.Activity &&
            <Activity transactions={transactions} accounts={accounts} signalRefresh={signalRefreshTrans} />
          }

          { UIState === State.Stats &&
            <Stats transactions={transactions} accounts={accounts} />
          }

          { UIState === State.Assets &&
            <Assets user={user} accounts={accounts} transactions={transactions} signalRefresh={signalRefreshAcct} />
          }

          { UIState === State.Market &&
            <>work in progress</>
          }

          { UIState === State.Profile &&
            <Profile user={user} setUser={setUser} logout={logout} />
          }

          { UIState === State.Settings &&
            <>work in progress</>
          }

        </main>
      }
    </div>
  );
}

export default App;
