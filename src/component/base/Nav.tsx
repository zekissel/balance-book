import { useState } from "react";
import { NavProps, State } from "../../typedef";


export default function Nav ({ setState }: NavProps) {

  const [showNav, setShowNav] = useState(true);
  const toggleNav = () => setShowNav(!showNav);

  return (
    <nav>
      <li id='nav-toggle' onClick={toggleNav}>
        <img src={ showNav ? 'close-arrow.svg' : 'open-arrow.svg' }/>
      </li>

      { showNav &&
        <>
          <li onClick={() => setState(State.Home)}>Home</li>
          <li onClick={() => setState(State.Activity)}>Activity</li>
          <li onClick={() => setState(State.Stats)}>Statistics</li>
          <li onClick={() => setState(State.Assets)}>Assets</li>
        </>
      }
      
    </nav>
  )
}