import { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { invoke } from "@tauri-apps/api";
import Profile from "./component/profile/Profile";
import { User } from "./typedef";
import Auth from "./component/auth/Auth";
import Nav from "./component/Nav";
import Activity from "./component/activity/Activity";
import Statistics from "./component/stats/Statistics";
import Accounts from "./component/account/Accounts";
import Market from "./component/market/Market";
import Home from "./component/home/Home";
import Settings from "./component/settings/Settings";
import Sync from "./component/Sync";

function App() {

  const [user, setUser] = useState<User | null>({ 
    id: sessionStorage.getItem('uid') ?? '', 
    name: sessionStorage.getItem('uname') ?? '', 
    email: sessionStorage.getItem('umail') ?? '',
  });
  const verifyUser = (user: User) => { 
    setUser(user);
    sessionStorage.setItem('uid', user.id);
    sessionStorage.setItem('uname', user.name);
    sessionStorage.setItem('umail', user.email ?? '');
  }
  const logout = async () => {
    if (user?.id) await invoke('logout', { id: user.id })
    setUser(null);
    sessionStorage.clear();
  }

  return (
    <div className='w-screen h-screen flex flex-row overflow-hidden '>
      <BrowserRouter>
				<Routes>
          
          <Route path='/' element={<Auth verifyUser={verifyUser} />} />

          { user !== null &&
            <Route element={<Nav />}>

              <Route path='/home' element={<Home />} />
              <Route path='/activity' element={<Activity />} />
              <Route path='/stats' element={<Statistics />} />
              <Route path='/accounts' element={<Accounts />} />
              <Route path='/market' element={<Market />} />

              <Route path='/profile' element={<Profile user={user} setUser={verifyUser} logout={logout} />} />
              <Route path='/settings' element={<Settings />} />

            </Route>
          }
        </Routes>
      </BrowserRouter>

      { user !== null && <Sync user={user} /> }
    </div>
  );
}

export default App;
