import { useState, useEffect } from "react";
import { Transaction, Account, User } from "../../typedef";
import { getTransactions, getAccounts } from "../../typeassist";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "../template/Nav";
import Home from "./Home";
import Activity from "./Activity";
import Stats from "./Stats";
import Assets from "./Assets";
import "../../styles/App.css";
import Profile from "./Profile";
import Auth from "./Auth";

function App() {

  const [user, setUser] = useState<User | null>({
    id: localStorage.getItem('userid') ?? '',
    uname: localStorage.getItem('username') ?? '',
    email: localStorage.getItem('useremail') ?? '',
    fname: localStorage.getItem('userf') ?? '',
    lname: localStorage.getItem('userl') ?? '',
    dob: localStorage.getItem('dob') ? new Date(localStorage.getItem('dob') as string) : null,
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [signalAcct, setSignalAcct] = useState(false);
  const [signalTrans, setSignalTrans] = useState(false);
  
  const signalRefreshAcct = () => setSignalAcct(!signalAcct);
  const signalRefreshTrans = () => setSignalTrans(!signalTrans);
  const update = (refresh: () => void) => {
    setTimeout(() => { refresh() }, 400);
  }
  const refreshAccounts = async () => { if (user) setAccounts(await getAccounts(user.id)) };
  const refreshTransactions = async () => { setTransactions(await getTransactions(accounts.map(a => a.id))) };
  useEffect(() => { update(refreshAccounts) }, [signalRefreshAcct, user]);
  useEffect(() => { update(refreshTransactions) }, [signalRefreshTrans, accounts])
  useEffect(() => { localStorage.removeItem('link_token'); localStorage.removeItem('auth_state'); }, [user]);


  
  const verify = (user: User) => { 
    setUser(user);
    localStorage.setItem('userid', user.id);
    localStorage.setItem('username', user.uname); 
    if (user.email) localStorage.setItem('useremail', user.email);
    if (user.fname) localStorage.setItem('userf', user.fname);
    if (user.lname) localStorage.setItem('userl', user.lname);
    if (user.dob) localStorage.setItem('dob', user.dob.toDateString());
    
  }
  const logout = () => { 
    setUser(null); 
    localStorage.removeItem('userid');
    localStorage.removeItem('username');
    localStorage.removeItem('useremail');
    localStorage.removeItem('userf');
    localStorage.removeItem('userl');
    localStorage.removeItem('dob');
  }

  return (
    <div className='app'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Auth verify={verify} logout={logout} />} />

          <Route element={<Nav />} >

            <Route path='/home' element={<Home user={user!} accounts={accounts} transactions={transactions} />} />
            <Route path='/activity' element={<Activity transactions={transactions} accounts={accounts} signalRefresh={signalRefreshTrans} />} />
            <Route path='/stats' element={<Stats transactions={transactions} accounts={accounts} />} />
            <Route path='/assets' element={<Assets user={user!} accounts={accounts} transactions={transactions} signalRefresh={signalRefreshAcct} />} />
            <Route path='/market' element={<>work in progress</>} />
            <Route path='/profile' element={<Profile user={user!} setUser={setUser} logout={logout} refreshAcct={refreshAccounts} refreshTrans={refreshTransactions} />} />
            <Route path='/settings' element={<>work in progress</>} />
            
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;