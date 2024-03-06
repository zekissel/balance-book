import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { Expense } from "../typedef";
import List from "./activity/List";
import Calendar from "./activity/Calendar";
import "../styles/Activity.css";

export default function Activity () {

  const [listView, setListView] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  async function getExpenses() {
    await invoke("load_expenses")
      .then(data => {
        const exp = data as Expense[];
        exp.forEach(e => e.date = new Date(new Date(e.date).toDateString()));
        exp.sort((a, b) => a.date > b.date ? -1 : 1);
        setExpenses(exp);
      })
  }

  useEffect(() => {
    getExpenses()
  }, [])




  return (
    <div id='activity-container'>

      <menu>
        <button onClick={() => setListView(true)} disabled={listView}>List</button>
        <button onClick={() => setListView(false)} disabled={!listView}>Calendar</button>

        
      </menu>

      { listView ?
        <List expenses={expenses}/>
        :
        <Calendar expenses={expenses}/>      
      }

    </div>
  );
}