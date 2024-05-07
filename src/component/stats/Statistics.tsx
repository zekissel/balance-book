import { useState, useEffect } from "react"
import Menu, { MenuButton } from "../Menu"
import { anyFiltersActive, empty_filter, Filter } from "../Filter";
import FilterBar from "../FilterMenu";
import { Account, Transaction, getAccounts, getCalendarTransactions, addDays } from "../../typedef";
import StatsMain from "./StatsMain";

interface StatProps { }
export default function Statistics({}: StatProps) {

  enum FilterState { Relative, Absolute }
  const [state, setState] = useState<FilterState>(FilterState.Relative);
  const [range, setRange] = useState<number>(2);
  const handleRange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setRange(Number(e.target.value));
    setTimeout(() => refresh(), 350);
  }
  const [multiplier, setMultiplier] = useState<number>(7);

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const toggleFilters = () => setShowFilters(!showFilters);
  const [filters, setFilters] = useState(empty_filter);

  const [signal, setSignal] = useState<boolean>(false);
  const refresh = () => setSignal(!signal);

  const [logs, setLogs] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const filter: Filter = { ...filters, 
        start_date: filters.start_date ?? addDays(new Date(), -((range * multiplier) + 1)),
        end_date: filters.end_date ?? addDays(new Date(), 0),
      };
      const trans = await getCalendarTransactions(filter);
      setLogs(trans);
    }
    fetchLogs();
  }, [signal]);

  useEffect(() => {
    const fetchAccounts = async () => {
      setAccounts(await getAccounts());
    }
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (filters.start_date || filters.end_date) {
      setState(FilterState.Absolute);
    } else {
      setState(FilterState.Relative);
    }
  }, [filters.start_date, filters.end_date]);

  return (
    <div className='w-full'>
      <Menu
        leftPanel={
          <>
            <MenuButton onClick={() => {}} children={<input value={range} onChange={handleRange} className='w-8 text-right' type='text' />} active={state === FilterState.Relative} />
            <MenuButton onClick={() => {setMultiplier(1);refresh()}} children={<><img src='/menu/cal-day.svg' draggable={false} /> Days</>} active={state === FilterState.Relative && multiplier === 1} />
            <MenuButton onClick={() => {setMultiplier(7);refresh()}} children={<><img src='/menu/cal-week.svg' draggable={false} /> Weeks</>} active={state === FilterState.Relative && multiplier === 7} />
            <MenuButton onClick={() => {setMultiplier(30);refresh()}} children={<><img src='/menu/calendar.svg' draggable={false} /> Months</>} active={state === FilterState.Relative && multiplier === 30} />
            <MenuButton onClick={() => {setMultiplier(365);refresh()}} children={<><img src='/menu/cal-year.svg' draggable={false} /> Years</>} active={state === FilterState.Relative && multiplier === 365} />
          </>
        }
        rightPanel={
          <>
            <MenuButton onClick={toggleFilters} children={<><img src='/menu/filter.svg' draggable={false} /> Filters</>} active={showFilters} filterActive={anyFiltersActive(filters)} />
          </>
        }
      />

      { showFilters && <FilterBar filters={filters} setFilters={setFilters} signal={signal} refresh={refresh} /> }

      <StatsMain logs={logs} accounts={accounts} startDate={filters.start_date ? addDays(filters.start_date, 1) : addDays(new Date(), -((range * multiplier) + 0))} endDate={filters.end_date ?? addDays(new Date(), 0)} />

    </div>
  )
}