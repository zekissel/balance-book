import { LogProps } from "../../typedef";
import { useEffect, useMemo, useRef, useState } from "react";
import { Day, Month, Expense, Income } from "../../typedef";
import Transaction from "../home/Transaction";


interface CalendarProps { logs: LogProps }
export default function Calendar ({ logs }: CalendarProps) {

  const [showExpense, setShowExpense] = useState(false);
  const toggleExpense = () => setShowExpense(!showExpense);


  const curDate = useRef(new Date());
  const calDate = useRef(new Date(curDate.current.setHours(0,0,0,0)));

  const [week1, setWeek1] = useState<Day[]>([]);
  const [week2, setWeek2] = useState<Day[]>([]);
  const [week3, setWeek3] = useState<Day[]>([]);
  const [week4, setWeek4] = useState<Day[]>([]);
  const [week5, setWeek5] = useState<Day[]>([]);

  const weeks = useMemo(() => [week1, week2, week3, week4, week5], [week1, week2, week3, week4, week5]);

  function addDays(date: Date, days: number) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + days,
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    );
  }

  function fillDay (week: Day[], dayIndex: number) {
    week[dayIndex].expenses = logs.expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const dayDate = week[dayIndex].date;
      return expDate.toDateString() == dayDate.toDateString();
    });
    week[dayIndex].income = logs.income.filter(inc => {
      const incDate = new Date(inc.date);
      const dayDate = week[dayIndex].date;
      return incDate.toDateString() == dayDate.toDateString();
    });
  }

  function fillWeek (offset: number = 0) {
    const week: Day[] = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ date: addDays(calDate.current, i - calDate.current.getDay() + offset), expenses: [], income: [] }));

    for (let i = 0; i < calDate.current.getDay(); i++) fillDay(week, i);
    for (let i = calDate.current.getDay(); i < 7; i++) fillDay(week, i);
    for (let i = 0; i < 7; i++) {
      week[i].expenses = week[i].expenses.sort((a, b) => {
        return a.amount > b.amount ? -1 : 1;
      });
      week[i].income = week[i].income.sort((a, b) => {
        return a.amount > b.amount ? -1 : 1;
      });
    }

    return week;
  }

  const initWeeks = () => {
    setWeek1(fillWeek(-14));
    setWeek2(fillWeek(-7));
    setWeek3(fillWeek());
    setWeek4(fillWeek(7));
    setWeek5(fillWeek(14));
  }

  const shiftWeeks = (direction: number) => {
    calDate.current = addDays(calDate.current, direction * 7);
    initWeeks();
  }

  const processWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) shiftWeeks(1);
    else shiftWeeks(-1);
  }

  useEffect(() => {
    initWeeks();
    
  }, [logs, curDate.current]);

  const [selectedTransaction, setSelectedTransaction] = useState<Expense | Income | null>(null);

  const todayStyle = { 
    backgroundColor: '#69a6c1', 
    border: `2px solid rgb(106, 146, 185)`,
    fontWeight: '600'
  };
  return (
    <div id='cal-container'>
      <menu id='cal-tools'>
        <span id='today' onClick={() => {calDate.current = curDate.current; initWeeks()}}>{ curDate.current.toDateString() }</span>

        <span id='cal-shift'>
          <button onClick={() => shiftWeeks(-1)}>◀</button>
          <select value={calDate.current.getMonth()} onChange={(e) => { calDate.current = new Date(new Date(calDate.current.setMonth(Number(e.target.value))).setDate(7)); initWeeks();}}>
            { Month.map((month, index) => <option key={index} value={index}>{month}</option>)}
          </select>
          <select value={calDate.current.getFullYear()} onChange={(e) => { calDate.current = new Date(calDate.current.setFullYear(Number(e.target.value))); initWeeks(); }}>
            { [20,21,22,23,24].map((year, index) => <option key={index} value={year+2000}>{year+2000}</option>)}
          </select>
          <button onClick={() => shiftWeeks(1)}>▶</button>
        </span>

        <button onClick={toggleExpense}>Filters</button>
      </menu>
      
      <table onWheel={processWheel}>
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>  
          </tr>
        </thead>
        <tbody>
          { weeks.map((week) => (
            <tr>
              {week.map((day, index) => (
                <td key={index}>
                  <div className='cal-day'>
                    <span className='day-tag' style={day.date.toDateString() === curDate.current.toDateString() ? todayStyle : undefined}>{ day.date.getDate() }</span>
                    <div className='day-items'>
                      { day.income.map((income, index) => 
                        <span className='cal-inc' key={index} onClick={() => setSelectedTransaction(income)}> + ${income.amount / 100} {income.source}</span>
                      )}
                      { day.expenses.map((expense, index) => 
                        <span className='cal-exp' key={index} onClick={() => setSelectedTransaction(expense)}> - ${expense.amount / 100} {expense.store}</span>
                      )}
                    </div>
                  </div>
              </td>
              ))}
            </tr>
          ))}
        </tbody>
        
      </table>
      { selectedTransaction && <Transaction transaction={selectedTransaction} toggle={() => setSelectedTransaction(null)} /> }

    </div>
  )
}