import { useState } from "react";
import "../../styles/Nav.css";
import { Outlet } from "react-router";
import { Link } from "react-router-dom";


//export interface NavProps { state: State, setState: React.Dispatch<React.SetStateAction<State>> }
export default function Nav () {

  const [fullNav, setFullNav] = useState(true);
  const toggleNav = () => setFullNav(!fullNav);

  const curPageStyle = (path: string) => new URL(window.location.href).pathname === path ? 'nav-current' : undefined;

  return (
    <>
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
        <Link to='/home' >
          <li id={curPageStyle('/home')}>
            { fullNav ? 'Home' : <img draggable={false} src='/home.svg' alt='Home' /> }
          </li>
        </Link>
        <Link to='/activity' >
          <li id={curPageStyle('/activity')}>
            { fullNav ? 'Activity' : <img draggable={false} src='/book.svg' alt='Activity' />}
          </li>
        </Link>
        <Link to='/stats' >
          <li id={curPageStyle('/stats')}>
            { fullNav ? 'Statistics' : <img draggable={false} src='/stats.svg' alt='Statistics' />}
          </li>
        </Link>
        <Link to='/assets' > 
          <li id={curPageStyle('/assets')}>
            { fullNav ? 'Accounts' : <img draggable={false} src='/wallet.svg' alt='Accounts' />}
          </li>
        </Link>
        <Link to='/market' >  
          <li id={curPageStyle('/market')}>
            { fullNav ? 'Market' : <img draggable={false} src='/candles.svg' alt='Market' />}
          </li>
        </Link>
      </ul>

      <ul className={ fullNav ? 'nav-extra' : 'nav-extra nav-inverse'}>
        <Link to='/profile' >
          <li id={curPageStyle('/profile')}>
            { fullNav ? 'Profile' : <img draggable={false} src='/user.svg' alt='Profile' />}
          </li>
        </Link>
        <Link to='/settings' >
          <li id={curPageStyle('/settings')}>
            { fullNav ? 'Settings' : <img draggable={false} src='/cog.svg' alt='Settings' />}
          </li>
        </Link>
      </ul>
      
    </nav>

    <main>
      <Outlet />
    </main>
    </>
  )
}