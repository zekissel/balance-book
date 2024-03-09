import { invoke } from "@tauri-apps/api/tauri";
import { useState, useMemo, useEffect } from "react";

import List from "./activity/List";
import Calendar from "./activity/Calendar";
import "../styles/Activity.css";
import { Expense, Income } from "../typedef";
import AddLog from "./home/AddLog";

export default function Activity () {

  const [filters, setFilters] = useState<Filters>({
    type: `all`,
    startDate: null,
    endDate: null,
    category: null,
    source: null,
    lowAmount: null,
    highAmount: null,
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [signalExp, setSignalExp] = useState(false);
  const signalNewExpense = () => setSignalExp(!signalExp);

  const [income, setIncome] = useState<Income[]>([]);
  const [signalInc, setSignalInc] = useState(false);
  const signalNewIncome = () => setSignalInc(!signalInc);

  const transactions = useMemo(() => {
    let transactions: Array<Expense | Income> = [];
    if (filters.type === `expense` || filters.type === `all`) transactions = transactions.concat(expenses);
    if (filters.type === `income` || filters.type === `all`) transactions = transactions.concat(income);
    if (filters.startDate !== null) transactions = transactions.filter(t => t.date.getTime() >= filters.startDate!.getTime());
    if (filters.endDate !== null) transactions = transactions.filter(t => t.date.getTime() <= filters.endDate!.getTime());

    transactions = transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    return transactions;
  }, [expenses, income, filters]);
  const updateLog = { signalExp: signalNewExpense, signalInc: signalNewIncome };

  async function getExpenses() {
    await invoke("load_expenses")
      .then(data => {
        const exp = data as Expense[];
        exp.forEach(e => e.date = new Date(new Date(e.date).toDateString()));
        exp.sort((a, b) => a.date > b.date ? -1 : 1);
        setExpenses(exp);
      })
  }

  async function getIncome() {
    await invoke("load_income")
      .then(data => {
        const inc = data as Income[];
        inc.forEach(i => i.date = new Date(new Date(i.date).toDateString()));
        inc.sort((a, b) => a.date > b.date ? -1 : 1);
        setIncome(inc);
      })
  }

  useEffect(() => {
    getExpenses()
  }, [signalExp])

  useEffect(() => {
    getIncome()
  }, [signalInc])



  const [listView, setListView] = useState(localStorage.getItem('listView') === 'true' ? true : false);
  const [showGUI, setShowGUI] = useState(false);
  const [filterGUI, setFilterGUI] = useState(false);
  const toggleGUI = () => setShowGUI(!showGUI);
  const toggleFilter = () => setFilterGUI(!filterGUI);



  return (
    <div id='activity-container'>

      <menu id='activity-menu'>
        <span id='activity-tools'>
          <button onClick={() => {setListView(true); localStorage.setItem('listView', 'true')}} disabled={listView}>List</button>
          <button onClick={() => {setListView(false); localStorage.setItem('listView', 'false')}} disabled={!listView}>Calendar</button>
        </span>
        
        <span id='activity-extra'>
          <button onClick={toggleGUI} disabled={showGUI}>Log Transaction</button>
          <button onClick={toggleFilter} disabled={filterGUI}>Filter</button>
        </span>
        
      </menu>

      { listView ?
        <List logs={transactions}/>
        :
        <Calendar logs={transactions}/> 
      }

      { showGUI && <AddLog toggle={toggleGUI} updateLog={updateLog}/>}

      { filterGUI && 
        <Filter toggle={toggleFilter} filters={filters} setFilters={setFilters} /> 
      }

    </div>
  );
}

interface Filters {
  type: string,
  startDate: Date | null,
  endDate: Date | null,
  category: string | null,
  source: string | null,
  lowAmount: number | null,
  highAmount: number | null,
}

interface FilterProps { toggle: () => void, filters: Filters, setFilters: React.Dispatch<React.SetStateAction<Filters>> }
function Filter ({ toggle, filters, setFilters }: FilterProps) {

  const [showStartDate, setShowStartDate] = useState(filters.startDate !== null);
  const toggleStartDate = () => setShowStartDate(!showStartDate);
  const [showEndDate, setShowEndDate] = useState(filters.endDate !== null);
  const toggleEndDate = () => setShowEndDate(!showEndDate);

  return (
    <fieldset id='filter-field'><legend>Set Filters</legend>

      <li>
        <label>Transaction Type</label>
        <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value as string})} >
          <option value={`all`}>All</option>
          <option value={`expense`}>Expense</option>
          <option value={`income`}>Income</option>
        </select>
      </li>

      <li>
        <label onClick={() => { toggleStartDate(); setFilters({...filters, startDate: null}); }}>Start Date</label>
        { showStartDate && <input type='date' defaultValue={filters.startDate?.toDateString()} onChange={(e) => setFilters({...filters, startDate: new Date(e.target.value)})}/> }
        <label onClick={() => { toggleEndDate(); setFilters({...filters, endDate: null}); }}>End Date</label>
        { showEndDate && <input type='date' onChange={(e) => setFilters({...filters, endDate: new Date(e.target.value)})} defaultValue={filters.endDate?.toDateString()}/> }
      </li>

      <li>
        <label>Category</label>
        <select>
          <option value={undefined}>All</option>

        </select>
      </li>

      <li>
        <label>Store/Source</label>
        <input type='text' onChange={(e) => setFilters({...filters, source: e.target.value})}/>
      </li>

      <li>
        <label>Low Amount</label>
        <input type='number' step={.01} onChange={(e) => setFilters({...filters, lowAmount: Number(e.target.value)})}/>
        <label>High Amount</label>
        <input type='number' step={.01} onChange={(e) => setFilters({...filters, highAmount: Number(e.target.value)})}/>
      </li>

      <li>
        <button onClick={() => setFilters({ 
          type: `all`, 
          startDate: null,
          endDate: null,
          category: null,
          source: null,
          lowAmount: null,
          highAmount: null, 
        })}>Clear Filters</button>
        <button onClick={toggle}>X</button>
      </li>

    </fieldset>
  )
}