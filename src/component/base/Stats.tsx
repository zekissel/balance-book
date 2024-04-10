import { useState, useMemo } from "react";
import { Transaction, Filter, filterTransactions, anyFiltersActive, Account } from "../../typedef"
import { addDays } from "../../typeassist";
import StatsPage from "../stats/StatsPage"
import FilterGUI from "../template/FilterBar";
import "../../styles/Stats.css"
import '../../styles/Page.css'
import "../../styles/Menu.css"

interface StatsProps { transactions: Transaction[], accounts: Account[] }
export default function Stats ({ transactions, accounts }: StatsProps) {
  
  /* filter transactions before being sent to page */
  const anyDateFilters = () => (filters.startDate !== null || filters.endDate !== null)
  const [showFilter, setFilterGUI] = useState(false);
  const toggleFilter = () => setFilterGUI(!showFilter);
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

  const [timeRange, setTimeRange] = useState(sessionStorage.getItem('stats.timeRange') ? Number(sessionStorage.getItem('stats.timeRange')) : 2);
  const [rangeMultiplier, setRangeMultiplier] = useState(sessionStorage.getItem('stats.timeMulti') ? Number(sessionStorage.getItem('stats.timeMulti')) : 7);

  /* filters get superior say on date specification (if only one is set then the other side has no limit); otherwise listen to stats menu bar */
  const endDate = useMemo(() => {
    if (filters.endDate !== null) return filters.endDate;
    else if (filters.startDate !== null && filters.endDate === null) {
      return addDays(transactions.reduce((max, p) => p.date > max ? p.date : max, new Date()), 1);
    }
    else return addDays(new Date(), 0);
  }, [filters.endDate, filters.startDate, transactions]);
  const startDate = useMemo(() => {
    if (filters.startDate !== null) return filters.startDate;
    else if (filters.endDate !== null && filters.startDate === null) {
      return addDays(transactions.reduce((min, p) => p.date < min ? p.date : min, new Date()), -1);
    }
    else return new Date((new Date(endDate.getTime() - (((timeRange * rangeMultiplier) - 1) * 24 * 60 * 60 * 1000))).toDateString())
  }, [filters.startDate, filters.endDate, endDate, timeRange, rangeMultiplier, transactions]);
  
  /* transactions after filters are applied */
  const filteredTransactions = useMemo(() => {
    return filterTransactions({ transactions, filters });
  }, [transactions, filters])

  /* transactions within timeframe set by stats menu bar (void if filter dates are set) */
  const timeFrameTransactions = useMemo(() => {
    if (anyDateFilters()) return filteredTransactions;
    return filteredTransactions.filter(t => ((t.date.getTime() - startDate.getTime() >= 0) && (endDate.getTime() - t.date.getTime() >= 0)));
  }, [filteredTransactions, startDate, endDate]);

  /* future transactions, after endDate (whether set by filters or automatically) */
  const upcomingTransactions = useMemo(() => {
    return filteredTransactions.filter(t => t.date.getTime() > endDate.getTime());
  }, [filteredTransactions, endDate]);

  const updateMultiplier = (multi: number) => {
    setRangeMultiplier(multi);
    sessionStorage.setItem('stats.timeMulti', multi.toString());
  }

  const updateRangeDays = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
    if (!am || am.match(/^\d{1,}?$/)) {
      setTimeRange(Number(am));
      sessionStorage.setItem('stats.timeRange', am);
    }
  }

  return (
    <div className='page-root'>
      <menu className='dynamic-menu'>
        <div className='dynamic-menu-main'>
          <button id={ !anyDateFilters() && rangeMultiplier > 0 ? 'dynamic-menu-current' : undefined}><input type='text' value={timeRange} onChange={updateRangeDays}/></button>
          <button id={ !anyDateFilters() && rangeMultiplier === 1 ? 'dynamic-menu-current' : undefined} onClick={() => updateMultiplier(1)}><img src='/cal-day.svg' /> Days</button>
          <button id={ !anyDateFilters() && rangeMultiplier === 7 ? 'dynamic-menu-current' : undefined} onClick={() => updateMultiplier(7)}><img src='/cal-week.svg' /> Weeks</button>
          <button id={ !anyDateFilters() && rangeMultiplier === 30 ? 'dynamic-menu-current' : undefined} onClick={() => updateMultiplier(30)}><img src='/calendar.svg' /> Months</button>
          <button id={ !anyDateFilters() && rangeMultiplier === 365 ? 'dynamic-menu-current' : undefined} onClick={() => updateMultiplier(365)}><img src='/cal-year.svg' /> Years</button>
        </div>

        <div className='dynamic-menu-main'>
          <button onClick={toggleFilter}
            style={ anyFiltersActive(filters) ? filtersActiveStyle : undefined}><img src='/filter.svg'/> Filter</button>
        </div>
      </menu>

      { showFilter && <FilterGUI accounts={accounts} toggle={toggleFilter} filters={filters} setFilters={setFilters} /> }

      <StatsPage transactions={timeFrameTransactions} accounts={accounts} upcoming={upcomingTransactions} startDate={startDate} endDate={endDate} showFilter={showFilter}/>

    </div>
  )
}

const filtersActiveStyle = { backgroundColor: `#a0bacb`}