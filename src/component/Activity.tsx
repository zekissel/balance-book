
import { useState } from "react";

import List from "./activity/List";
import Calendar from "./activity/Calendar";
import "../styles/Activity.css";
import { UpdateLogProps, LogProps } from "../typedef";
import AddLog from "./home/AddLog";

interface ActivityProps { logs: LogProps, updateLogs: UpdateLogProps }
export default function Activity ({ logs, updateLogs }: ActivityProps) {

  const [listView, setListView] = useState(localStorage.getItem('listView') === 'true' ? true : false);
  const [showGUI, setShowGUI] = useState(false);
  const toggleGUI = () => setShowGUI(!showGUI);


  return (
    <div id='activity-container'>

      <menu id='activity-menu'>
        <span id='activity-tools'>
          <button onClick={() => {setListView(true); localStorage.setItem('listView', 'true')}} disabled={listView}>List</button>
          <button onClick={() => {setListView(false); localStorage.setItem('listView', 'false')}} disabled={!listView}>Calendar</button>
        </span>
        
        <span id='activity-extra'>
          <button onClick={toggleGUI} disabled={showGUI}>Log Transaction</button>
          <button>Edit</button>
        </span>
        
      </menu>

      { listView ?
        <List logs={logs}/>
        :
        <Calendar logs={logs}/>      
      }

      { showGUI && <AddLog toggle={toggleGUI} updateLog={updateLogs}/>}

    </div>
  );
}