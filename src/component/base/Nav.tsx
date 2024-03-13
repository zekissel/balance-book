import { useState } from "react";
import { State } from "../../typedef";
import "../../styles/Nav.css";


export interface NavProps { state: State, setState: React.Dispatch<React.SetStateAction<State>> }
export default function Nav ({ state, setState }: NavProps) {

  const [fullNav, setFullNav] = useState(true);
  const toggleNav = () => setFullNav(!fullNav);

  return (
    <nav>

      <ul className='nav-top'>
        <li onClick={toggleNav}>
          <img 
            draggable={false} 
            src={ fullNav ? 'close-arrow.svg' : 'open-arrow.svg' } 
            alt={ fullNav ? 'Close navigation menu' : 'Open navigation menu' }
          />
        </li>
      </ul>
      
      <ul className='nav-core'>
        <li id={state === State.Home ? 'nav-current' : undefined} onClick={() => setState(State.Home)}>
          { fullNav ? 'Home' : <img draggable={false} src='/home.svg' alt='Home' /> }
        </li>
        <li id={state === State.Activity ? 'nav-current' : undefined} onClick={() => setState(State.Activity)}>
          { fullNav ? 'Activity' : <img draggable={false} src='/book.svg' alt='Activity' />}
        </li>
        <li id={state === State.Stats ? 'nav-current' : undefined} onClick={() => setState(State.Stats)}>
        { fullNav ? 'Statistics' : <img draggable={false} src='/stats.svg' alt='Statistics' />}
        </li>
        <li id={state === State.Assets ? 'nav-current' : undefined} onClick={() => setState(State.Assets)}>
        { fullNav ? 'Assets' : <img draggable={false} src='/graph.svg' alt='Assets' />}
        </li>
      </ul>

      <ul className={ fullNav ? 'nav-extra' : 'nav-extra nav-inverse'}>
        <li id={state === State.Profile ? 'nav-current' : undefined} onClick={() => setState(State.Profile)}>
        { fullNav ? 'Profile' : <img draggable={false} src='/globe.svg' alt='Profile' />}
        </li>
        <li id={state === State.Settings ? 'nav-current' : undefined} onClick={() => setState(State.Settings)}>
        { fullNav ? 'Settings' : <img draggable={false} src='/cog.svg' alt='Settings' />}
        </li>
      </ul>
      
    </nav>
  )
}