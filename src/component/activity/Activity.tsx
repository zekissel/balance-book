import { useState } from "react"
import Menu, { MenuButton } from "../Menu"
import FilterBar from "../FilterMenu";
import List from "./List";
import { anyFiltersActive, empty_filter } from "../Filter";
import AddLog from "./AddLog";
import Calendar from "./Calendar";

interface ActivityProps { }
export default function Activity({}: ActivityProps) {

  enum UIState { List, Calendar }
  const [state, setState] = useState<UIState>(UIState.List);

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const toggleFilters = () => setShowFilters(!showFilters);
  const [filters, setFilters] = useState(empty_filter);
  const [signal, setSignal] = useState<boolean>(false);
  const refresh = () => setSignal(!signal);

  const [showAddLog, setShowAddLog] = useState<boolean>(false);
  const toggleAddLog = () => setShowAddLog(!showAddLog);

  return (
    <div className='w-full'>
      <Menu
        leftPanel={
          <>
            <MenuButton onClick={() => setState(UIState.List)} children={<><img src='/menu/list.svg' draggable={false} /> List</>} active={state === UIState.List} />
            <MenuButton onClick={() => setState(UIState.Calendar)} children={<><img src='/menu/calendar.svg' draggable={false} /> Calendar</>} active={state === UIState.Calendar} />
          </>
        }
        rightPanel={
          <>
            <MenuButton onClick={toggleAddLog} children={<><img src='/menu/add-log.svg' draggable={false} /> Add Log</>} active={false} />
            <MenuButton onClick={toggleFilters} children={<><img src='/menu/filter.svg' draggable={false} /> Filters</>} active={showFilters} filterActive={anyFiltersActive(filters)} />
          </>
        }
      />

      { showFilters && <FilterBar filters={filters} setFilters={setFilters} signal={signal} refresh={refresh} /> }

      { showAddLog && <AddLog cancel={toggleAddLog} update={refresh} /> }
      
      <main className='h-full'>
        { state === UIState.List &&
          <List filters={filters} signal={signal} update={refresh} />
        }

        { state === UIState.Calendar &&
          <Calendar filters={filters} signal={signal} update={refresh} />
        }
      </main>

    </div>
  )
}