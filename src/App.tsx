import { useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { getAccounts, getTransactions, Transaction, Account } from "./typedef";

import Disclaimer from "./routes/Disclaimer";
import SetupPlaid from "./routes/SetupPlaid";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Home from "./routes/Home";
import BaseLayout from "./routes/BaseLayout";
import List from "./routes/Home/List";
import Calendar from "./routes/Home/Calendar";
import Statistics from "./routes/Home/Statistics";
import Profile from "./routes/Home/Profile";
import { EditAccount } from "./routes/Home/AccountTools";

import "./App.css";


function App() {

  const [refresh, setRefresh] = useState(false);
  const signalRefresh = () => setRefresh(!refresh);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const clearData = () => {
    setAccounts([]);
    setTransactions([]);
    console.log('cleared data');
  }
  
  useEffect(() => {
    const fetchAccounts = async () => setAccounts(await getAccounts());
    fetchAccounts();
    console.log('fetched accounts');
  }, [ refresh ]);
  
  useEffect(() => {
    const fetchTransactions = async () => setTransactions(await getTransactions(accounts.map(a => a.id)));
    fetchTransactions();
    console.log('fetched transactions');
  }, [ accounts ]);


    

  return (
    <Routes>
      <Route path='/' />
        <Route index element={<Disclaimer />} />

        <Route element={<BaseLayout />}>
          <Route path="plaid" element={<SetupPlaid />} />
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />
        </Route>

        <Route 
          path="profile/:profile" 
          element={<Home signal={signalRefresh} clear={clearData}/>}
        >
          <Route index element={<Profile accounts={accounts} refresh={signalRefresh} /> } />
          <Route path="account/:account" element={<EditAccount accounts={accounts} refresh={signalRefresh} />} />

          <Route path="list" element={<List accounts={accounts} transactions={transactions} />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="stats" element={<Statistics />} />
        </Route>
    </Routes>
  );
}

export default App;
