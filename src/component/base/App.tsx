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
	});

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

	const [signalAcct, setSignalAcct] = useState(0);
	const signalRefreshAcct = () => setSignalAcct((signalAcct + 1) % 255);
	const [signalTrans, setSignalTrans] = useState(false);
	const signalRefreshTrans = () => setSignalTrans(!signalTrans);
	
  const update = (refresh: () => void): (() => void) => {
		const timeout = setTimeout(() => {
			refresh();
		}, 400);
    return () => clearTimeout(timeout);
	};
   
	useEffect(() => {
    const refreshAccounts = async () => {
      //console.log('acc')
      if (user) {
        const accts = await getAccounts(user.id)
        if (!ignore) setAccounts(accts);
      }
    };
    let ignore = false;
		const buffer = update(refreshAccounts);

    return () => { ignore = true; buffer(); }
	}, [signalRefreshAcct]); 
	useEffect(() => {
    const refreshTransactions = async () => {
      //console.log('trans')
      const trans = await getTransactions(accounts.map((a) => a.id), transRange);
      if (!ignore) setTransactions(trans);
    };
    let ignore = false;
		const buffer = update(refreshTransactions);
    return () => { ignore = true; buffer(); }
	}, [signalRefreshTrans]); 

	useEffect(() => {
		localStorage.removeItem('link_token');
		localStorage.removeItem('auth_state');

    const transSyncDate = localStorage.getItem('sync.t.date');
    const syncTrans = transSyncDate ? (addHours(new Date(transSyncDate), 6) < new Date(new Date().toISOString().split('.')[0])) : true;

    const balSyncDate = localStorage.getItem('sync.b.date');
    const syncBalance = balSyncDate ? new Date(balSyncDate) < new Date(new Date().toISOString().split('T')[0]) : true;

		if (user) {
			if (syncTrans) invoke('sync_info', { userId: user.id, balance: syncBalance });
      if (syncBalance) localStorage.setItem('sync.b.date', new Date().toISOString().split('T')[0]);
      if (syncTrans) localStorage.setItem('sync.t.date', new Date().toISOString().split('.')[0]);

      const refreshTransactions = async () => {
        const trans = await getTransactions(accounts.map((a) => a.id), transRange);
        if (!ignore) setTransactions(trans);
      };
      let ignore = false;
			const buffer = update(refreshTransactions);
      return () => { ignore = true; buffer(); }
		}
	}, [user]);

	const clearUserLocalStorage = () => {
		localStorage.removeItem('userid');
		localStorage.removeItem('username');
		localStorage.removeItem('useremail');
		localStorage.removeItem('userf');
		localStorage.removeItem('userl');
		localStorage.removeItem('dob');
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
	};
	const logout = () => {
		setUser(null);
		clearUserLocalStorage();
	};

	// MARK: - RENDER
	return (
		<div className="app">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Auth verify={verify} logout={logout} />} />

          { user && <>
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
					</Route></>}
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
