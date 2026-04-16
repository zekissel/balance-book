
import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";


interface HomeProps { signal: () => void; clear: () => void; }
export default function Home ({ signal, clear }: HomeProps) {
  const navigate = useNavigate();
  useEffect(() => {
    signal();
  }, []);

  const switchUser = () => { clear(); navigate('/login'); }

  return (
    <main>

      <nav>
        <ul className='nav-left'>
          <span><NavLink to='list'>
            <img src='/list.svg' alt='List' />
          </NavLink></span>
          <span><NavLink to='calendar'>
            <img src='/calendar.svg' alt='Calendar' />
          </NavLink></span>
          <span><NavLink to='stats'>
            <img src='/stats.svg' alt='Statistics' />
          </NavLink></span>
        </ul>

        <ul className='nav-right'> { location.pathname.split('/').length > 3 ?
          <span><NavLink to=''>
            <img src='/profile.svg' alt='Profile' />
          </NavLink></span>
          :
          <>
            <button onClick={switchUser}>
              <img src='/exit.svg' alt='Logout' />
            </button>
            <input type='button' value='?' />
          </>
        }</ul>
      </nav>

      { (location.pathname.split('/').length > 3) && 
        (location.pathname.split('/')[3] !== 'account') && 
        
        <menu>
          <button onClick={() => {}}>
            <img src='/filter.svg' alt='Filter' />
          </button>
        </menu>
      }

      <Outlet />
    </main>
  )
}