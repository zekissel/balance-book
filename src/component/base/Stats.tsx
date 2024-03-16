import { useState, useEffect, useMemo } from "react";
import { Income, Expense, getExpenses, getIncome } from "../../typedef"
import StatsPage from "../stats/StatsPage"
import "../../styles/Stats.css"
import "../../styles/Menu.css"

export default function Stats () {

  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const refreshExpenses = async () => { setExpenses(await getExpenses()) };
  const refreshIncome = async () => { setIncome(await getIncome()) };

  useEffect(() => {
    refreshExpenses();
    refreshIncome();
  }, [])

  const allTransactions = useMemo(() => {
    let transactions: Array<Income | Expense> = [];
    return transactions.concat(income).concat(expenses).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [income, expenses])


  const [timeRange, setTimeRange] = useState(30);

  return (
    <div id='stats-root'>
      <menu className='dynamic-menu'>
        <div className='dynamic-menu-main'>
          <button id={ timeRange === 14 ? 'dynamic-menu-current' : undefined} onClick={() => setTimeRange(14)}><img src='/2week.svg' /> 2 Weeks</button>
          <button id={ timeRange === 30 ? 'dynamic-menu-current' : undefined} onClick={() => setTimeRange(30)}><img src='/30day.svg' /> 30 Days</button>
          <button id={ timeRange === 90 ? 'dynamic-menu-current' : undefined} onClick={() => setTimeRange(90)}><img src='/3month.svg' /> 3 Months</button>
          <button id={ timeRange === 182 ? 'dynamic-menu-current' : undefined} onClick={() => setTimeRange(182)}><img src='/6month.svg' /> 6 Months</button>
          <button id={ timeRange === 365 ? 'dynamic-menu-current' : undefined} onClick={() => setTimeRange(365)}><img src='/1year.svg' /> 1 Year</button>
        </div>

        <div className='dynamic-menu-main'>
          <button><img src='/filter.svg'/> Filter</button>
        </div>
      </menu>

      <StatsPage transactions={allTransactions} timeRange={timeRange} />

    </div>
  )
}