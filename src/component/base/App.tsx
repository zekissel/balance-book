import { useState, useEffect } from "react";
import { State, Transaction, Account } from "../../typedef";
import { getTransactions, getAccounts } from "../../typeassist";
import Nav from "./Nav";
import Home from "./Home";
import Activity from "./Activity";
import Stats from "./Stats";
import Assets from "./Assets";
import "../../styles/App.css";

function App() {

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [signalTrans, setSignalTrans] = useState(false);
  const signalRefreshTrans = () => setSignalTrans(!signalTrans);
  const refreshTransactions = async () => { setTransactions(await getTransactions()) };
  useEffect(() => { refreshTransactions() }, [signalRefreshTrans])


  const [accounts, setAccounts] = useState<Account[]>([]);
  const [signalAcct, setSignalAcct] = useState(false);
  const signalRefreshAcct = () => setSignalAcct(!signalAcct);
  const refreshAccounts = async () => { setAccounts(await getAccounts()) };
  useEffect(() => { refreshAccounts() }, [signalRefreshAcct]);


  const [UIState, setUIState] = useState(State.Home);
  return (
    <div className='app'>
      <Nav state={UIState} setState={setUIState}/>

      <main>
        { UIState === State.Home &&
          <Home />
        }

        { UIState === State.Activity &&
          <Activity transactions={transactions} signalRefresh={signalRefreshTrans} />
        }

        { UIState === State.Stats &&
          <Stats transactions={transactions} />
        }

        { UIState === State.Assets &&
          <Assets accounts={accounts} transactions={transactions} signalRefresh={signalRefreshAcct} />
        }

        { UIState === State.Market &&
          <>not made</>
        }

        { UIState === State.Profile &&
          <>not made</>
        }

        { UIState === State.Settings &&
          <>not made</>
        }
        
      </main>
    </div>
  );
}

export default App;
