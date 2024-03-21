import { useState, useMemo, useEffect } from "react";

import List from "../activity/List";
import Calendar from "../activity/Calendar";
import "../../styles/Page.css";
import "../../styles/Menu.css";
import { Transaction, Filters, filterTransactions } from "../../typedef";
import { getTransactions } from "../../typeassist";
import EditLog from "../transaction/CreateLog";
import Filter from "../template/Filter";

export default function Activity () {

  /* filter transactions by object state */
  const [filterGUI, setFilterGUI] = useState(false);
  const toggleFilter = () => setFilterGUI(!filterGUI);
  const [filters, setFilters] = useState<Filters>({
    type: sessionStorage.getItem('filter.type') ?? `all`,
    startDate: sessionStorage.getItem('filter.start') ? new Date(sessionStorage.getItem('filter.start')!) : null,
    endDate: sessionStorage.getItem('filter.end') ? new Date(sessionStorage.getItem('filter.end')!) : null,
    category: sessionStorage.getItem('filter.category')?.split(' ') ?? [],
    source: sessionStorage.getItem('filter.source')?.split(' ') ?? [''],
    lowAmount: sessionStorage.getItem('filter.low') ?? '0',
    highAmount: sessionStorage.getItem('filter.high') ?? '0',
    accounts: sessionStorage.getItem('filter.accounts')?.split(' ').map(a => Number(a)) ?? [],
  });
  const anyFiltersActive = () => {
    return (filters.type !== `all` || filters.startDate !== null || filters.endDate !== null || filters.category.length > 0 || filters.source[0].length > 0 || Number(filters.lowAmount) !== 0 || Number(filters.highAmount) !== 0 || filters.accounts.length > 0);
  };


  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [signalTransUpdate, setSignalTransUpdate] = useState(false);
  const signalRefresh = () => setSignalTransUpdate(!signalTransUpdate);
  const refreshTransactions = async () => { setTransactions(await getTransactions()) };

  const filteredTransactions = useMemo(() => {
    return filterTransactions({ transactions, filters });
  }, [transactions, filters]);

  useEffect(() => {
    refreshTransactions();
  }, [signalTransUpdate])


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
          { addLogGUI && <EditLog toggle={toggleAddLog} updateLog={signalRefresh} />}
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
        <List logs={filteredTransactions} updateLog={signalRefresh} showFilter={filterGUI} />
        :
        <Calendar logs={filteredTransactions} updateLog={signalRefresh} showFilter={filterGUI} /> 
      }
      
    </div>
  );
}
