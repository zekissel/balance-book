import { useState, useMemo, useEffect } from "react";

import List from "../activity/List";
import Calendar from "../activity/Calendar";
import "../../styles/Page.css";
import "../../styles/Menu.css";
import { Expense, Income, Filters, filterTransactions } from "../../typedef";
import { getExpenses, getIncome } from "../../typeassist";
import EditLog from "../transaction/CreateLog";
import Filter from "../activity/Filter";

export default function Activity () {

  /* filter transactions by object state */
  const [filterGUI, setFilterGUI] = useState(false);
  const toggleFilter = () => setFilterGUI(!filterGUI);
  const [filters, setFilters] = useState<Filters>({
    type: `all`,
    startDate: null,
    endDate: null,
    category: [],
    source: [''],
    lowAmount: '0',
    highAmount: '0',
    accounts: [],
  });
  const anyFiltersActive = () => {
    return (filters.type !== `all` || filters.startDate !== null || filters.endDate !== null || filters.category.length > 0 || filters.source[0].length > 0 || Number(filters.lowAmount) !== 0 || Number(filters.highAmount) !== 0 || filters.accounts.length > 0);
  };

  /* compile expenses and income from backend into Transaction[] */
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [signalExp, setSignalExp] = useState(false);
  const signalNewExpense = () => setSignalExp(!signalExp);

  const [income, setIncome] = useState<Income[]>([]);
  const [signalInc, setSignalInc] = useState(false);
  const signalNewIncome = () => setSignalInc(!signalInc);

  const updateLog = { signalExp: signalNewExpense, signalInc: signalNewIncome };

  const transactions = useMemo(() => {
    return filterTransactions({ expenses, income, filters });
  }, [expenses, income, filters]);

  const refreshExpenses = async () => { setExpenses(await getExpenses()) };
  const refreshIncome = async () => { setIncome(await getIncome()) };

  useEffect(() => {
    refreshExpenses();
  }, [signalExp])

  useEffect(() => {
    refreshIncome();
  }, [signalInc])


  /* toggle between list and calendar view, toggle GUI for adding a new transaction */
  const [listView, setListView] = useState(localStorage.getItem('listView') === 'true' ? true : false);
  const [addLogGUI, setAddLogGUI] = useState(false);
  const toggleAddLog = () => setAddLogGUI(!addLogGUI);
  

  const filtersActiveStyle = { backgroundColor: `#a0bacb`}

  return (
    <div className='page-root'>

      <menu className='dynamic-menu'>
        <div className='dynamic-menu-main'>
          <button 
            id={ listView ? 'dynamic-menu-current' : undefined}
            onClick={() => {setListView(true); localStorage.setItem('listView', 'true')}} 
            disabled={listView}
          >
            <img src='/list.svg' /> List
          </button>
          <button 
            id={ !listView ? 'dynamic-menu-current' : undefined}
            onClick={() => {setListView(false); localStorage.setItem('listView', 'false')}} 
            disabled={!listView}
          >
            <img src='/calendar.svg' /> Calendar
          </button>
        </div>
        
        <div className='dynamic-menu-main'>
          <button 
            onClick={toggleAddLog}
          >
            <img src='/log.svg' /> Add Log
          </button>
          { addLogGUI && <EditLog toggle={toggleAddLog} updateLog={updateLog} />}
          <button 
            onClick={toggleFilter}
            style={anyFiltersActive() ? filtersActiveStyle : undefined}
            >
              <img src='/filter.svg'/> Filter
          </button>
        </div>
      </menu>

      { filterGUI && <Filter toggle={toggleFilter} filters={filters} setFilters={setFilters} /> }

      { listView ?
        <List logs={transactions} updateLog={updateLog} showFilter={filterGUI} />
        :
        <Calendar logs={transactions} updateLog={updateLog} showFilter={filterGUI} /> 
      }
      
    </div>
  );
}
