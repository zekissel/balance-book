import { invoke } from "@tauri-apps/api/tauri";
import React, { useState } from "react";
import { Category } from "../../typedef";

interface ExpenseProps { toggle: () => void }
export default function AddExpense ({ toggle }: ExpenseProps) {

  const [store, setStore] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(Category.None);
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date());



  async function addExpense() {
    if (store === '' || amount === 0 || category === Category.None) return;

    await invoke("add_expense", { 
      'store': store,
      'amount': Math.round((amount + Number.EPSILON) * 100),
      'category': category,
      'desc': desc,
      'date': new Date(date.toDateString()),
    });

    toggle();
  }

  return (
    <fieldset>
      <legend>Add Expense</legend>

      <li>Store:<input type='text' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStore(e.target.value)}/></li>
      <li>Amount:<input type='number' step={.01} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(Number(e.target.value))}/></li>
      <li>Category:
        <select value={category} onChange={(e) => setCategory(Category[e.target.value as keyof typeof Category])}>
          {getEnumKeys(Category).map((key, index) => (
            <option key={index} value={Category[key]}>
              {key}
            </option>
          ))}
        </select>
      </li>
      <li>Description:<input type='text' onChange={(e) => setDesc(e.target.value)}/></li>
      <li>Date:
        <input type='date' onChange={(e) => {
          setDate(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')));
          }} />
      </li>

      <button onClick={addExpense}>Submit</button>
      <button onClick={toggle}>Cancel</button>
    </fieldset>
  );
}

function getEnumKeys<
   T extends string,
   TEnumValue extends string | number,
>(enumVariable: { [key in T]: TEnumValue }) {
    return Object.keys(enumVariable) as Array<T>;
}