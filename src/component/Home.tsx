import { useState } from "react";
import AddExpense from "./home/AddExpense";

export default function Home () {

  

  const [showExpense, setShowExpense] = useState(false);
  const toggleExpense = () => setShowExpense(!showExpense);

  return (
    <>
      Home

      { showExpense ?
        <AddExpense toggle={toggleExpense}/>
        :
        <button onClick={toggleExpense}>Add Expense</button>
      }
    
    </>
  );
}