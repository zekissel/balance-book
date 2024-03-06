import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { Expense } from "../typedef";
import AddExpense from "./home/AddExpense";
import List from "./activity/List";
import Calendar from "./activity/Calendar";
import "../styles/Activity.css";

export default function Activity () {

  const [listView, setListView] = useState(localStorage.getItem('listView') === 'true' ? true : false);
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

      <menu id='activity-menu'>
        <span id='activity-tools'>
          <button onClick={() => {setListView(true); localStorage.setItem('listView', 'true')}} disabled={listView}>List</button>
          <button onClick={() => {setListView(false); localStorage.setItem('listView', 'false')}} disabled={!listView}>Calendar</button>
        </span>
        
        <span id='activity-extra'>
          <button>Log Transaction</button>
          <button>Remove</button>
        </span>
        
      </menu>

      { listView ?
        <List expenses={expenses}/>
        :
        <Calendar expenses={expenses}/>      
      }

    </div>
  );
}