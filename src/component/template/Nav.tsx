import { useState } from 'react';
import '../../styles/Nav.css';
import { Outlet } from 'react-router';
import { Link } from 'react-router-dom';

export default function Nav() {
	const [fullNav, setFullNav] = useState(true);
	const toggleNav = () => setFullNav(!fullNav);

	const [curPage, setCurPage] = useState(new URL(window.location.href).pathname);

	return (
		<>
			<nav onClick={() => setCurPage(new URL(window.location.href).pathname)}>
				<ul className="nav-top">
					<li onClick={toggleNav}>
						<img
							draggable={false}
							src={fullNav ? 'close-arrow.svg' : 'open-arrow.svg'}
							alt={fullNav ? 'Close navigation menu' : 'Open navigation menu'}
						/>
					</li>
				</ul>

				<ul className="nav-core">
					<Link to="/home">
						<li id={curPage === '/home' ? 'nav-current' : undefined}>
							{fullNav ? 'Home' : <img draggable={false} src="/home.svg" alt="Home" />}
						</li>
					</Link>
					<Link to="/activity">
						<li id={curPage === '/activity' ? 'nav-current' : undefined}>
							{fullNav ? 'Activity' : <img draggable={false} src="/book.svg" alt="Activity" />}
						</li>
					</Link>
					<Link to="/stats">
						<li id={curPage === '/stats' ? 'nav-current' : undefined}>
							{fullNav ? 'Statistics' : <img draggable={false} src="/stats.svg" alt="Statistics" />}
						</li>
					</Link>
					<Link to="/assets">
						<li id={curPage === '/assets' ? 'nav-current' : undefined}>
							{fullNav ? 'Accounts' : <img draggable={false} src="/wallet.svg" alt="Accounts" />}
						</li>
					</Link>
					<Link to="/market">
						<li id={curPage === '/market' ? 'nav-current' : undefined}>
							{fullNav ? 'Market' : <img draggable={false} src="/candles.svg" alt="Market" />}
						</li>
					</Link>
					<Link to="/budget">
						<li id={curPage === '/budget' ? 'nav-current' : undefined}>
							{fullNav ? 'Budget' : <img draggable={false} src="/budget.svg" alt="Budget" />}
						</li>
					</Link>
				</ul>

				<ul className={fullNav ? 'nav-extra' : 'nav-extra nav-inverse'}>
					<Link to="/profile">
						<li id={curPage === '/profile' ? 'nav-current' : undefined}>
							{fullNav ? 'Profile' : <img draggable={false} src="/user.svg" alt="Profile" />}
						</li>
					</Link>
					<Link to="/settings">
						<li id={curPage === '/settings' ? 'nav-current' : undefined}>
							{fullNav ? 'Settings' : <img draggable={false} src="/cog.svg" alt="Settings" />}
						</li>
					</Link>
				</ul>
			</nav>

			<main>
				<Outlet />
			</main>
		</>
	);
}
