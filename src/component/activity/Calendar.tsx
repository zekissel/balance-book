import { LogProps, UpdateLogProps } from "../../typedef";
import { useEffect, useMemo, useRef, useState } from "react";
import { Day, Month, Expense, Income, addDays, isExpense } from "../../typedef";
import Transaction from "../home/Transaction";
import ViewDay from "./ViewDay";


interface CalendarProps { logs: LogProps, updateLog: UpdateLogProps }
export default function Calendar ({ logs, updateLog }: CalendarProps) {

  const curDate = useRef(new Date());
  const calDate = useRef(new Date(curDate.current.setHours(0,0,0,0)));

  const [week1, setWeek1] = useState<Day[]>([]);
  const [week2, setWeek2] = useState<Day[]>([]);
  const [week3, setWeek3] = useState<Day[]>([]);
  const [week4, setWeek4] = useState<Day[]>([]);
  const [week5, setWeek5] = useState<Day[]>([]);

  const weeks = useMemo(() => [week1, week2, week3, week4, week5], [week1, week2, week3, week4, week5]);

  function fillDay (week: Day[], dayIndex: number) {
    week[dayIndex].transactions = logs.filter(exp => {
      const expDate = new Date(exp.date);
      const dayDate = week[dayIndex].date;
      return expDate.toDateString() == dayDate.toDateString();
    });
  }

  function fillWeek (offset: number = 0) {
    const week: Day[] = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ date: addDays(calDate.current, i - calDate.current.getDay() + offset), transactions: [] }));

    for (let i = 0; i < calDate.current.getDay(); i++) fillDay(week, i);
    for (let i = calDate.current.getDay(); i < 7; i++) fillDay(week, i);
    for (let i = 0; i < 7; i++) {
      week[i].transactions = week[i].transactions.sort((a, b) => {
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

  const [selectedTransactions, setSelectedTransactions] = useState<(Expense | Income)[]>([]);
  const [selectedDay, setSelectedDay] = useState<Day[]>([]);

  return (
    <div id='cal-container'>
      <menu id='cal-tools'>

        <span id='today' onClick={() => {calDate.current = curDate.current; initWeeks()}}>{ curDate.current.toDateString() }</span>

        <span id='cal-shift'>
          <button onClick={() => shiftWeeks(-1)}><img src='left-arrow.svg' /></button>

          <select value={calDate.current.getMonth()} onChange={(e) => { calDate.current = new Date(new Date(calDate.current.setMonth(Number(e.target.value))).setDate(7)); initWeeks();}}>
            { Month.map((month, index) => <option key={index} value={index}>{month}</option>)}
          </select>

          <select value={calDate.current.getFullYear()} onChange={(e) => { calDate.current = new Date(calDate.current.setFullYear(Number(e.target.value))); initWeeks(); }}>
            { [20,21,22,23,24].map((year, index) => <option key={index} value={year+2000}>{year+2000}</option>)}
          </select>

          <button onClick={() => shiftWeeks(1)}><img src='right-arrow.svg' /></button>
        </span>
      </menu>
      
      <table onWheel={processWheel}>

        <thead>
          <tr>
            <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>  
          </tr>
        </thead>

        <tbody>
          { weeks.map((week) => (
            <tr>
              {week.map((day, index) => (
                <td key={index} onClick={() => setSelectedDay([...selectedDay, day])}>

                  <div className='cal-day'>
                    <span className='day-tag' style={day.date.toDateString() === curDate.current.toDateString() ? todayStyle : undefined}>
                      { day.date.getDate() }
                    </span>
                    <div className='day-items'>
                      { day.transactions.map((trans, index) => 
                        <span 
                          className={ isExpense(trans) ? 'cal-exp' : 'cal-inc'}
                          key={index} 
                          onClick={(e) => {setSelectedTransactions([...selectedTransactions, trans]); e.stopPropagation();}}
                          > + ${trans.amount / 100} { isExpense(trans) ? trans.store : trans.source}</span>
                      )}
                    </div>
                  </div>

                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      { selectedTransactions.length > 0 && 
        selectedTransactions.map((trans, index) => (
          <Transaction 
            key={index} 
            transaction={trans} 
            toggle={() => setSelectedTransactions(selectedTransactions.filter(t => JSON.stringify(t) !== JSON.stringify(trans)))}
            updateLog={updateLog}
          />
        ))
      }

      { selectedDay.length > 0 && 
        selectedDay.map((day, index) => (
          <ViewDay 
            key={index}
            day={day}
            toggle={() => setSelectedDay(selectedDay.filter(d => JSON.stringify(d) !== JSON.stringify(day)))}
          />
        ))
      }

    </div>
  )
}

const todayStyle = { 
  backgroundColor: '#69a6c1', 
  border: `2px solid rgb(106, 146, 185)`,
  fontWeight: '600'
};