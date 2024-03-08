import { useState } from "react";
import AddLog from "./home/AddLog";
import { UpdateLogProps } from "../typedef";

interface HomeProps { updateLog: UpdateLogProps }
export default function Home ({ updateLog }: HomeProps) {

  const [showExpense, setShowExpense] = useState(false);
  const toggleExpense = () => setShowExpense(!showExpense);

  return (
    <>
      Home

      { showExpense ?
        <AddLog toggle={toggleExpense} updateLog={updateLog}/>
        :
        <button onClick={toggleExpense}>Log Transaction</button>
      }
    
    </>
  );
}