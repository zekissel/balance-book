import { useState } from "react";
import { State } from "../../typedef";
import Nav from "./Nav";
import Home from "./Home";
import Activity from "./Activity";
import Stats from "./Stats";
import Assets from "./Assets";
import "../../styles/App.css";

function App() {
  const [UIState, setUIState] = useState(State.Home);

  return (
    <div className='app'>
      <Nav state={UIState} setState={setUIState}/>

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
