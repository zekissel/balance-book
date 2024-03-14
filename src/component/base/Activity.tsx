import { useState, useMemo, useEffect } from "react";

import List from "../activity/List";
import Calendar from "../activity/Calendar";
import "../../styles/Activity.css";
import { Expense, Income, isExpense, getExpenses, getIncome, Filters } from "../../typedef";
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
  });
  const anyFiltersActive = () => {
    return (filters.type !== `all` || filters.startDate !== null || filters.endDate !== null || filters.category.length > 0 || filters.source[0].length > 0 || Number(filters.lowAmount) !== 0 || Number(filters.highAmount) !== 0)
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
    let transactions: Array<Expense | Income> = [];

    if (filters.type === `expense` || filters.type === `all`) transactions = transactions.concat(expenses);
    if (filters.type === `income` || filters.type === `all`) transactions = transactions.concat(income);

    if (filters.startDate !== null) transactions = transactions.filter(t => t.date.getTime() >= filters.startDate!.getTime());
    if (filters.endDate !== null) transactions = transactions.filter(t => t.date.getTime() <= filters.endDate!.getTime());

    if (filters.category.length > 0) transactions = transactions.filter(t => filters.category.includes(t.category.toString()));

    if (filters.source[0].length > 0) transactions = transactions.filter(t => filters.source.map(s => s.toUpperCase().trim()).includes((isExpense(t) ? t.store : t.source).toUpperCase()));

    if (Number(filters.lowAmount) > 0) transactions = transactions.filter(t => (t.amount - ((Number(filters.lowAmount)) * 100)) >= 0 );
    if (Number(filters.highAmount) > 0) transactions = transactions.filter(t => (t.amount - ((Number(filters.highAmount)) * 100)) <= 0 );

    transactions = transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    return transactions;
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
    <div className='activity-root'>

      <menu className='activity-menu'>
        <div className='activity-menu-main'>
          <button 
            id={ listView ? 'activity-menu-current' : undefined}
            onClick={() => {setListView(true); localStorage.setItem('listView', 'true')}} 
            disabled={listView}
          >
            <img src='/list.svg' /> List
          </button>
          <button 
            id={ !listView ? 'activity-menu-current' : undefined}
            onClick={() => {setListView(false); localStorage.setItem('listView', 'false')}} 
            disabled={!listView}
          >
            <img src='/calendar.svg' /> Calendar
          </button>
        </div>
        
        <div className='activity-menu-main'>
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
