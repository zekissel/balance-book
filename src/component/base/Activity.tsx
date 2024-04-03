import { useState, useMemo } from "react";
import { Transaction, Filter, filterTransactions, anyFiltersActive, Account } from "../../typedef";
import List from "../activity/List";
import Calendar from "../activity/Calendar";
import EditLog from "../transaction/CreateLog";
import FilterGUI from "../template/FilterBar";
import "../../styles/Page.css";
import "../../styles/Menu.css";


interface ActivityProps { transactions: Transaction[], accounts: Account[], signalRefresh: () => void }
export default function Activity ({ transactions, accounts, signalRefresh }: ActivityProps) {

  /* filter transactions by object state (filter function declared in typedef) */
  const [filterGUI, setFilterGUI] = useState(false);
  const toggleFilter = () => setFilterGUI(!filterGUI);
  const [filters, setFilters] = useState<Filter>({
    type: sessionStorage.getItem('filter.type') ?? `all`,
    startDate: sessionStorage.getItem('filter.start') ? new Date(sessionStorage.getItem('filter.start')!) : null,
    endDate: sessionStorage.getItem('filter.end') ? new Date(sessionStorage.getItem('filter.end')!) : null,
    category: sessionStorage.getItem('filter.category')?.split(' ') ?? [],
    source: sessionStorage.getItem('filter.source')?.split(' ') ?? [''],
    lowAmount: sessionStorage.getItem('filter.low') ?? '0',
    highAmount: sessionStorage.getItem('filter.high') ?? '0',
    accounts: sessionStorage.getItem('filter.accounts')?.split(' ') ?? [],
  });

  const filteredTransactions = useMemo(() => {
    return filterTransactions({ transactions, filters });
  }, [transactions, filters]);


  /* toggle between list and calendar view, toggle GUI for adding a new transaction */
  const [listView, setListView] = useState(localStorage.getItem('listView') === 'true' ? true : false);
  const [addLogGUI, setAddLogGUI] = useState(false);
  const toggleAddLog = () => setAddLogGUI(!addLogGUI);

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
          { addLogGUI && <EditLog accounts={accounts} toggle={toggleAddLog} updateLog={signalRefresh} />}
          <button 
            onClick={toggleFilter}
            style={ anyFiltersActive(filters) ? filtersActiveStyle : undefined}
            >
              <img src='/filter.svg'/> Filter
          </button>
        </div>
      </menu>

      { filterGUI && <FilterGUI accounts={accounts} toggle={toggleFilter} filters={filters} setFilters={setFilters} /> }

      { listView ?
        <List logs={filteredTransactions} accounts={accounts} updateLog={signalRefresh} showFilter={filterGUI} />
        :
        <Calendar logs={filteredTransactions} accounts={accounts} updateLog={signalRefresh} showFilter={filterGUI} /> 
      }
      
    </div>
  );
}
const filtersActiveStyle = { backgroundColor: `#a0bacb`}