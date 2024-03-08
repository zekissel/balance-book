import { invoke } from "@tauri-apps/api/tauri";
import { useState, useEffect } from "react";
import Nav from "./Nav";
import { State, Expense, Income } from "../typedef";
import "../styles/App.css";
import Home from "./Home";
import Activity from "./Activity";

function App() {
  const [UIState, setUIState] = useState(State.Home);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [signalExp, setSignalExp] = useState(false);
  const signalNewExpense = () => setSignalExp(!signalExp);

  const [income, setIncome] = useState<Income[]>([]);
  const [signalInc, setSignalInc] = useState(false);
  const signalNewIncome = () => setSignalInc(!signalInc);

  const logs = { expenses, income };
  const updateLog = { signalExp: signalNewExpense, signalInc: signalNewIncome };

  async function getExpenses() {
    await invoke("load_expenses")
      .then(data => {
        const exp = data as Expense[];
        exp.forEach(e => e.date = new Date(new Date(e.date).toDateString()));
        exp.sort((a, b) => a.date > b.date ? -1 : 1);
        setExpenses(exp);
      })
  }

  async function getIncome() {
    await invoke("load_income")
      .then(data => {
        const inc = data as Income[];
        inc.forEach(i => i.date = new Date(new Date(i.date).toDateString()));
        inc.sort((a, b) => a.date > b.date ? -1 : 1);
        setIncome(inc);
      })
  }

  useEffect(() => {
    getExpenses()
  }, [signalExp])

  useEffect(() => {
    getIncome()
  }, [signalInc])

  return (
    <div id='base'>
      <Nav setState={setUIState}/>

      <main>
        { UIState === State.Home &&
          <Home updateLog={updateLog}/>
        }

        { UIState === State.Activity &&
          <Activity logs={logs} updateLogs={updateLog} />
        }

        { UIState === State.Stats &&
          <>not made</>
        }

        { UIState === State.Assets &&
          <>not made</>
        }
      </main>
    </div>
  );
}

export default App;
