import { useState, useEffect } from "react";
import { State, Transaction, Account, User } from "../../typedef";
import { getTransactions, getAccounts } from "../../typeassist";
import Nav from "./Nav";
import Home from "./Home";
import Activity from "./Activity";
import Stats from "./Stats";
import Assets from "./Assets";
import "../../styles/App.css";
import Profile from "./Profile";
import Auth from "./Auth";

function App() {

  const [user, setUser] = useState<User | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [signalTrans, setSignalTrans] = useState(false);
  const [signalAcct, setSignalAcct] = useState(false);

  const signalRefreshTrans = () => setSignalTrans(!signalTrans);
  const refreshTransactions = async () => { setTransactions(await getTransactions(accounts.map(a => a.id))) };
  const signalRefreshAcct = () => setSignalAcct(!signalAcct);
  const refreshAccounts = async () => { if (user) setAccounts(await getAccounts(user.id)) };
  useEffect(() => { refreshTransactions() }, [signalRefreshTrans, accounts])
  useEffect(() => { refreshAccounts() }, [signalRefreshAcct, user]);


  
  const [UIState, setUIState] = useState(State.Auth);
  const verify = (user: User) => { setUser(user); setUIState(State.Home); localStorage.setItem('user', user.name); }
  const logout = () => { setUser(null); setUIState(State.Auth); }
  return (
    <div className='app'>
      <Nav state={UIState} setState={setUIState}/>

      { UIState === State.Auth && <Auth verify={verify} logout={logout} /> }

      <main>
        { UIState === State.Home &&
          <Home />
        }

        { UIState === State.Activity &&
          <Activity transactions={transactions} accounts={accounts} signalRefresh={signalRefreshTrans} />
        }

        { UIState === State.Stats &&
          <Stats transactions={transactions} />
        }

        { UIState === State.Assets &&
          <Assets user={user ?? { 'id': 0, 'name': '', email: '' }} accounts={accounts} transactions={transactions} signalRefresh={signalRefreshAcct} />
        }

        { UIState === State.Market &&
          <>not made</>
        }

        { UIState === State.Profile &&
          <Profile logout={logout} />
        }

        { UIState === State.Settings &&
          <>not made</>
        }

      </main>
    </div>
  );
}

export default App;
