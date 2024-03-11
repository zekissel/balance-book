import { invoke } from "@tauri-apps/api/tauri";
import { useState, useMemo, useEffect } from "react";

import List from "./activity/List";
import Calendar from "./activity/Calendar";
import "../styles/Activity.css";
import { Category, Expense, Income, IncomeCategory, getEnumKeys, isExpense } from "../typedef";
import AddLog from "./home/AddLog";

export default function Activity () {

  const [filters, setFilters] = useState<Filters>({
    type: `all`,
    startDate: null,
    endDate: null,
    category: [],
    source: [''],
    lowAmount: 0,
    highAmount: 0,
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

    if (filters.category.length > 0) transactions = transactions.filter(t => filters.category.includes(t.category.toString()));

    if (filters.source[0].length > 0) transactions = transactions.filter(t => filters.source.map(s => s.toUpperCase().trim()).includes((isExpense(t) ? t.store : t.source).toUpperCase()));

    if (filters.lowAmount > 0) transactions = transactions.filter(t => t.amount >= filters.lowAmount);
    if (filters.highAmount > 0) transactions = transactions.filter(t => t.amount <= filters.highAmount);

    transactions = transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    console.log(transactions)
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

  const filtersActiveStyle = { backgroundColor: `#abc`}
  const anyFiltersActive = () => {
    return (filters.type !== `all` || filters.startDate !== null || filters.endDate !== null || filters.category.length > 0 || filters.source[0].length > 0 || filters.lowAmount > 0 || filters.highAmount > 0)
  };

  return (
    <div id='activity-container'>

      <menu id='activity-menu'>
        <span id='activity-tools'>
          <button onClick={() => {setListView(true); localStorage.setItem('listView', 'true')}} disabled={listView}>List</button>
          <button onClick={() => {setListView(false); localStorage.setItem('listView', 'false')}} disabled={!listView}>Calendar</button>
        </span>
        
        <span id='activity-extra'>
          <button onClick={toggleGUI} disabled={showGUI}>Log Transaction</button>
          <button onClick={toggleFilter} disabled={filterGUI}  style={anyFiltersActive() ? filtersActiveStyle : undefined}>Filter</button>
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
  category: string[],
  source: string[],
  lowAmount: number,
  highAmount: number,
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
        <select multiple 
          onChange={(e) => {
            if (filters.category.includes(e.target.value)) setFilters({...filters, category: filters.category.filter(c => c !== e.target.value)});
            else setFilters({...filters, category: [...filters.category, e.target.value]})
          }}>
          {getEnumKeys(Category).map((key, index) => (
            
            <option style={filters.category.includes(Category[key]) ? { backgroundColor: `#abc` }:undefined} key={index} value={Category[key]}>
              {Category[key]}
            </option>
          ))}
          {getEnumKeys(IncomeCategory).map((key, index) => (
            <option style={filters.category.includes(IncomeCategory[key]) ? { backgroundColor: `#abc` }:undefined} key={index} value={IncomeCategory[key]}>
              {IncomeCategory[key]}
            </option>
          ))}
        </select>
      </li>

      <li>
        <label>Store/Source</label>
        <input type='text' value={filters.source} onChange={(e) => setFilters({...filters, source: e.target.value.split(',')})}/>
      </li>

      <li>
        <label>Low Amount</label>
        <input type='number' step={.01} value={filters.lowAmount / 100} onChange={(e) => setFilters({...filters, lowAmount: Number(e.target.value) * 100})}/>
      </li>
      <li>
        <label>High Amount</label>
        <input type='number' step={.01} value={filters.highAmount / 100} onChange={(e) => setFilters({...filters, highAmount: Number(e.target.value) * 100})}/>
      </li>

      <li>
        <button onClick={() => setFilters({ 
          type: `all`, 
          startDate: null,
          endDate: null,
          category: [],
          source: [''],
          lowAmount: 0,
          highAmount: 0, 
        })}>Clear Filters</button>
        <button onClick={toggle}>X</button>
      </li>

    </fieldset>
  )
}