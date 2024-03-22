import { useState, useEffect } from "react";
import { State, Transaction } from "../../typedef";
import { getTransactions } from "../../typeassist";
import Nav from "./Nav";
import Home from "./Home";
import Activity from "./Activity";
import Stats from "./Stats";
import Assets from "./Assets";
import "../../styles/App.css";

function App() {

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [signal, setSignal] = useState(false);
  const signalRefresh = () => setSignal(!signal);
  const refreshTransactions = async () => { setTransactions(await getTransactions()) };
  useEffect(() => { refreshTransactions() }, [signal])

  const [UIState, setUIState] = useState(State.Home);
  return (
    <div className='app'>
      <Nav state={UIState} setState={setUIState}/>

      <main>
        { UIState === State.Home &&
          <Home />
        }

        { UIState === State.Activity &&
          <Activity transactions={transactions} signalRefresh={signalRefresh} />
        }

        { UIState === State.Stats &&
          <Stats transactions={transactions} />
        }

        { UIState === State.Assets &&
          <Assets />
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
