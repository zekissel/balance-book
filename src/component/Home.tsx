import { useState } from "react";
import Expense from "./home/Expense";

export default function Home () {

  

  const [showExpense, setShowExpense] = useState(false);
  const toggleExpense = () => setShowExpense(!showExpense);

  return (
    <>
      Home

      { showExpense ?
        <Expense toggle={toggleExpense}/>
        :
        <button onClick={toggleExpense}>Add Expense</button>
      }
    
    </>
  );
}