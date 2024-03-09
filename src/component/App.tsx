import { useState } from "react";
import Nav from "./Nav";
import { State } from "../typedef";
import "../styles/App.css";
import Home from "./Home";
import Activity from "./Activity";
import Stats from "./Stats";

function App() {
  const [UIState, setUIState] = useState(State.Home);

  

  return (
    <div id='base'>
      <Nav setState={setUIState}/>

      <main>
        { UIState === State.Home &&
          <Home />
        }

        { UIState === State.Activity &&
          <Activity />
        }

        { UIState === State.Stats &&
          <Stats />
        }

        { UIState === State.Assets &&
          <>not made</>
        }
      </main>
    </div>
  );
}

export default App;
