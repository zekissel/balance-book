import { invoke } from '@tauri-apps/api';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Transaction, Account, User } from '../../typedef';
import { getTransactions, getAccounts, addHours } from '../../typeassist';
import Nav from '../template/Nav';
import Home from './Home';
import Activity from './Activity';
import Stats from './Stats';
import Assets from './Assets';
import Profile from './Profile';
import Auth from './Auth';
import '../../styles/App.css';

function App() {
	const [user, setUser] = useState<User | null>({
		id: localStorage.getItem('userid') ?? '',
		uname: localStorage.getItem('username') ?? '',
		email: localStorage.getItem('useremail') ?? '',
		fname: localStorage.getItem('userf') ?? '',
		lname: localStorage.getItem('userl') ?? '',
		dob: localStorage.getItem('dob') ? new Date(localStorage.getItem('dob') as string) : null,
		plaid_id: localStorage.getItem('client_id') ?? '',
		plaid_secret: localStorage.getItem('plaid_s') ?? '',
	});

	const [moreTrans, setMoreTrans] = useState(false);
	const [transRange, setTransRange] = useState(
		sessionStorage.getItem('fetchRange') !== null
			? Number(sessionStorage.getItem('fetchRange'))
			: 89,
	);
	const incrementRange = () => {
		setTransRange(transRange + 90);
		sessionStorage.setItem('fetchRange', String(transRange + 90));
	};
	const setRange = (range: number) => {
		if (range > transRange) {
			setTransRange(range);
			sessionStorage.setItem('fetchRange', String(range));
		}
	};

	const [accounts, setAccounts] = useState<Account[]>([]);
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	const [updated, setUpdated] = useState<string[]>([]);
	//const filterUpdated = (id: string) => setUpdated(updated.filter((u) => u !== id));

	const [signalAcct, setSignalAcct] = useState(false);
	const signalRefreshAcct = () => setSignalAcct(!signalAcct);
	const [signalTrans, setSignalTrans] = useState(false);
	const signalRefreshTrans = () => setSignalTrans(!signalTrans);

	const refreshTransactions = async () => {
		const [trans, more] = await getTransactions(
			accounts.map((a) => a.id),
			transRange,
		);
		setTransactions(trans);
		setMoreTrans(more);
	};

	const refreshAccounts = async () => {
		if (user) {
			setAccounts(await getAccounts(user.id));
		} else setAccounts([]);
	};

	const update = (refresh: () => void): (() => void) => {
		const timeout = setTimeout(() => {
			refresh();
		}, 50);
		return () => clearTimeout(timeout);
	};

	useEffect(() => {
		const buffer = update(refreshAccounts);
		return () => buffer();
	}, [signalAcct]);

	useEffect(() => {
		const buffer = update(refreshTransactions);
		return () => buffer();
	}, [signalTrans]);

	useEffect(() => {
		localStorage.removeItem('link_token');
		localStorage.removeItem('auth_state');

		if (user && user.id !== '') {
			const transSyncDate = localStorage.getItem(`${user.uname}.sync.t.date`);
			const syncTrans = transSyncDate
				? addHours(new Date(transSyncDate), 6) < new Date(new Date().toISOString().split('.')[0])
				: true;
			
			const sync = async () => {
				await invoke('sync_info', { userId: user!.id, balance: true })
					.then((data) => {
						const recent = data as string[];
						setUpdated(recent);
					})
			}

			if (syncTrans && user.uname !== '') {
				sync();
				localStorage.setItem(`${user.uname}.sync.t.date`, new Date().toISOString().split('.')[0]);
			}
			update(refreshAccounts);
			update(refreshTransactions);

		} else {
			setAccounts([]);
			setTransactions([]);
		}
	}, [user]);

	const clearUserLocalStorage = () => {
		localStorage.removeItem('userid');
		localStorage.removeItem('username');
		localStorage.removeItem('useremail');
		localStorage.removeItem('userf');
		localStorage.removeItem('userl');
		localStorage.removeItem('dob');
		localStorage.removeItem('client_id');
		localStorage.removeItem('plaid_s');
		localStorage.removeItem('list.perPage')
		localStorage.removeItem('listView');
		localStorage.removeItem('stats.boxTypeInc');
		localStorage.removeItem('stats.categoryChartType');
		localStorage.removeItem('stats.categoryPieIncome');
		localStorage.removeItem('stats.historyGraphLine');
	};
	const verify = (user: User) => {
		clearUserLocalStorage();
		setUser(user);
		localStorage.setItem('userid', user.id);
		localStorage.setItem('username', user.uname);
		if (user.email) localStorage.setItem('useremail', user.email);
		if (user.fname) localStorage.setItem('userf', user.fname);
		if (user.lname) localStorage.setItem('userl', user.lname);
		if (user.dob) localStorage.setItem('dob', user.dob.toDateString());
		if (user.plaid_id) localStorage.setItem('client_id', user.plaid_id);
		if (user.plaid_secret) localStorage.setItem('plaid_s', user.plaid_secret);
	};
	const logout = () => {
		setUser(null);
		clearUserLocalStorage();
		setTransRange(89);
		sessionStorage.removeItem('fetchRange');
	};

	// MARK: - RENDER
	return (
		<div className="app">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Auth verify={verify} logout={logout} />} />

					{user && (
						<>
							<Route element={<Nav />}>
								<Route
									path="/home"
									element={<Home user={user!} accounts={accounts} transactions={transactions} />}
								/>
								<Route
									path="/activity"
									element={
										<Activity
											transactions={transactions}
											accounts={accounts}
											signalRefresh={signalRefreshTrans}
											incRange={incrementRange}
											setRange={setRange}
											more={moreTrans}
											updated={updated}
										/>
									}
								/>
								<Route
									path="/stats"
									element={
										<Stats
											transactions={transactions}
											accounts={accounts}
											signalRefresh={signalRefreshTrans}
											setRange={setRange}
										/>
									}
								/>
								<Route
									path="/assets"
									element={
										<Assets
											user={user}
											accounts={accounts}
											transactions={transactions}
											signalRefresh={signalRefreshAcct}
										/>
									}
								/>
								<Route path="/market" element={<>work in progress</>} />
								<Route
									path="/profile"
									element={
										<Profile
											user={user}
											setUser={setUser}
											logout={logout}
											refreshAcct={signalRefreshAcct}
											refreshTrans={signalRefreshTrans}
										/>
									}
								/>
								<Route path="/settings" element={<>work in progress</>} />
							</Route>
						</>
					)}
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
