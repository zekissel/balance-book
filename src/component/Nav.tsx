import { useState } from 'react';
import { Outlet } from 'react-router';
import { Link } from 'react-router-dom';

export default function Nav() {
	const [fullSize, setFullSize] = useState(true);
	const toggleNav = () => setFullSize(!fullSize);

	const [curPage, setCurPage] = useState(new URL(window.location.href).pathname);

	return (
		<>
			<nav 
        className={'h-screen w-fit bg-light1 text-white flex flex-col justify-between items-start p-0 border-r-primary border-r-solid border-r-2' + (fullSize ? '' : ' w-12')}
        onClick={() => setCurPage(new URL(window.location.href).pathname)}
      >
				<ul className='w-fit'>
					<li className={'bg-bbgray3 roundedxl m-2 p-2 rounded-xl hover:bg-bbgray1 ' + (fullSize ? 'w-full' : '')} onClick={toggleNav}>
						<img
							draggable={false}
							src={'/nav' + (fullSize ? '/close-arrow.svg' : '/open-arrow.svg')}
							alt={fullSize ? 'Close navigation menu' : 'Open navigation menu'}
						/>
					</li>
				</ul>

				<ul className='w-fit m-0 p-0 pt-4 pb-4'>

          {['/home', '/activity', '/stats', '/accounts', '/market'].map((path) => {
            return (
              <Link to={path} key={path}>
                <li className={(curPage === path ? 'bg-highlight ' : 'bg-light1 ') + 'p-2 m-2 rounded-xl border-b-dark2 border-b-solid border-b-2 hover:bg-highlight font-semibold text-dark1 ' + (fullSize ? '' : 'text-center')}>
                  {fullSize ? (path.charAt(1).toUpperCase() + path.slice(2)) : <img draggable={false} src={`/nav${path}.svg`} alt={(path.charAt(1).toUpperCase() + path.slice(2))} />}
                </li>
              </Link>
            )
          })}

				</ul>

				<ul className='w-full m-0 p-0 pt-4 pb-4 bg-dark1'>

					 {['/profile', '/settings'].map((path) => {
            return (
              <Link to={path} key={path}>
                <li className={(curPage === path ? 'bg-highlight ' : 'bg-light1 ') + 'p-2 m-2 rounded-xl hover:bg-highlight font-semibold text-dark1 '}>
                  {fullSize ? (path.charAt(1).toUpperCase() + path.slice(2)) : <img draggable={false} src={`/nav${path}.svg`} alt={(path.charAt(1).toUpperCase() + path.slice(2))} />}
                </li>
              </Link>
            )
          })}

				</ul>
			</nav>

			<Outlet />
		</>
	);
}
