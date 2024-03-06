import { ActivityProps } from "../../typedef";
import { useEffect, useMemo, useState } from "react";
import { Expense, Day } from "../../typedef";

export default function Calendar ({ expenses }: ActivityProps) {

  const [curDate, setDate] = useState(new Date());

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
    week[dayIndex].expenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const calDate = week[dayIndex].date;
      return expDate.toDateString() == calDate.toDateString();
    });
  }

  function fillWeek (offset: number = 0) {
    const week: Day[] = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ date: addDays(curDate, i - curDate.getDay() + offset), expenses: [] }));

    for (let i = 0; i < curDate.getDay(); i++) fillDay(week, i);
    for (let i = curDate.getDay(); i < 7; i++) fillDay(week, i);

    return week;
  }

  const initWeeks = () => {
    setWeek1(fillWeek(-21));
    setWeek2(fillWeek(-14));
    setWeek3(fillWeek(-7));
    setWeek4(fillWeek());
    setWeek5(fillWeek(7));
  }

  useEffect(() => {
    initWeeks();
    
  }, [expenses, curDate]);

  const todayStyle = { 
    backgroundColor: 'rgb(156, 196, 235)', 
    border: `2px solid rgb(106, 146, 185)`,
    fontWeight: '600'
  };
  return (
    <div id='cal-container'>
      { curDate.toDateString() }
      <table>
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
                    <span className='day-tag' style={day.date.toDateString() === curDate.toDateString() ? todayStyle : undefined}>{ day.date.getDate() }</span>
                    <div className='day-items'>
                      { day.expenses.map((expense, index) => 
                        <span className='cal-exp' key={index}>${expense.amount / 100} {expense.store}</span>
                      )}
                    </div>
                  </div>
              </td>
              ))}
            </tr>
          ))}
        </tbody>
        
      </table>
    </div>
  )
}