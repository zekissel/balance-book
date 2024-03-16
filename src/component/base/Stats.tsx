import { useState, useEffect, useMemo } from "react";
import { Income, Expense, getExpenses, getIncome, Filters } from "../../typedef"
import StatsPage from "../stats/StatsPage"
import Filter from "../activity/Filter";
import "../../styles/Stats.css"
import "../../styles/Menu.css"

export default function Stats () {

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


  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const refreshExpenses = async () => { setExpenses(await getExpenses()) };
  const refreshIncome = async () => { setIncome(await getIncome()) };

  useEffect(() => {
    refreshExpenses();
    refreshIncome();
  }, [])

  const allTransactions = useMemo(() => {
    let transactions: Array<Income | Expense> = [];
    return transactions.concat(income).concat(expenses).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [income, expenses])


  const [timeRange, setTimeRange] = useState(14);
  const [rangeMultiplier, setRangeMultiplier] = useState(1);

  const updateRangeDays = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
    if (!am || am.match(/^\d{1,}?$/)) {
      setTimeRange(Number(am));
    }
  }

  return (
    <div className={filterGUI?'main-down-shift stats-root':'stats-root'}>
      <menu className='dynamic-menu'>
        <div className='dynamic-menu-main'>
          <button id={ rangeMultiplier > 0 ? 'dynamic-menu-current' : undefined}><input type='text' value={timeRange} onChange={updateRangeDays}/></button>
          <button id={ rangeMultiplier === 1 ? 'dynamic-menu-current' : undefined} onClick={() => setRangeMultiplier(1)}><img src='/cal-day.svg' /> Days</button>
          <button id={ rangeMultiplier === 7 ? 'dynamic-menu-current' : undefined} onClick={() => setRangeMultiplier(7)}><img src='/cal-week.svg' /> Weeks</button>
          <button id={ rangeMultiplier === 30 ? 'dynamic-menu-current' : undefined} onClick={() => setRangeMultiplier(30)}><img src='/calendar.svg' /> Months</button>
          <button id={ rangeMultiplier === 365 ? 'dynamic-menu-current' : undefined} onClick={() => setRangeMultiplier(365)}><img src='/cal-year.svg' /> Years</button>
        </div>

        <div className='dynamic-menu-main'>
          <button onClick={toggleFilter}
            style={anyFiltersActive() ? filtersActiveStyle : undefined}><img src='/filter.svg'/> Filter</button>
        </div>
      </menu>

      { filterGUI && <Filter toggle={toggleFilter} filters={filters} setFilters={setFilters} /> }

      <StatsPage transactions={allTransactions} timeRange={timeRange * rangeMultiplier} />

    </div>
  )
}

const filtersActiveStyle = { backgroundColor: `#a0bacb`}