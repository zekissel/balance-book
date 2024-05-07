import { useState, useEffect, useMemo, useRef } from "react";
import { Filter } from "../Filter";
import { Account, Transaction, getAccounts, getCalendarTransactions, addDays } from "../../typedef";
import ViewLog from "./ViewLog";
import ViewMultiLog from "./MultiLog";

interface CalendarProps { 
  filters: Filter;
  signal: boolean;
  update: () => void;
}
export default function Calendar({ filters, signal, update }: CalendarProps) {

  const currentDate = useRef(new Date());
  const calendarDate = useRef(new Date(currentDate.current.setHours(0, 0, 0, 0)));

  const [logs, setLogs] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [selectLogs, setSelectLogs] = useState<string[]>([]);
  const updateSelected = (transId: string) => {
    if (selectLogs.includes(transId)) setSelectLogs(selectLogs.filter(t => t !== transId));
    else setSelectLogs([...selectLogs, transId]);
  }
  const selected: Transaction[] = useMemo(() => {
    return logs.filter(t => selectLogs.includes(t.id));
  }, [selectLogs, logs]);
  const selectedType = useMemo(() => {
    const leafs = selected.map(t => t.category.split('>')[1]);
    if (leafs.includes('Credit') || leafs.includes('Transfer')) return 0;
    const inFlow = selected.filter(t => t.amount > 0);
    if (inFlow.length === selected.length) return 1;
    const outFlow = selected.filter(t => t.amount < 0);
    if (outFlow.length === selected.length) return -1;
    return 0;
  }, [selected]);

  useEffect(() => {
    const fetchLogs = async () => {
      setSelectLogs([]);

      const filter: Filter = { ...filters, 
        start_date: filters.start_date ?? addDays(calendarDate.current, -21),
        end_date: filters.end_date ?? addDays(calendarDate.current, 21),
      };
      const trans = await getCalendarTransactions(filter);
      setLogs(trans);
    }
    fetchLogs();
  }, [signal, calendarDate.current]);

  useEffect(() => {
    const fetchAccounts = async () => {
      setAccounts(await getAccounts());
    }
    fetchAccounts();
  }, []);


  const [week1, setWeek1] = useState<Day[]>([]);
	const [week2, setWeek2] = useState<Day[]>([]);
	const [week3, setWeek3] = useState<Day[]>([]);
	const [week4, setWeek4] = useState<Day[]>([]);
	const [week5, setWeek5] = useState<Day[]>([]);

	const weeks = useMemo(
		() => [week1, week2, week3, week4, week5],
		[week1, week2, week3, week4, week5],
	);
	const yearRange = useMemo(() => {
		if (logs.length === 0)
			return Array.from({ length: 8 }, (_, i) => currentDate.current.getFullYear() - 3 + i);
		const minYear =
			logs
				.reduce((min, log) => {
					const logYear = new Date(log.date).getFullYear();
					return logYear < min.date.getFullYear() ? log : min;
				})
				.date.getFullYear() - 3;
		const maxYear =
			Math.max(
				logs
					.reduce((max, log) => {
						const logYear = new Date(log.date).getFullYear();
						return logYear > max.date.getFullYear() ? log : max;
					})
					.date.getFullYear(),
				currentDate.current.getFullYear(),
			) + 3;
		return Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
	}, [logs]);

	function fillDay(week: Day[], dayIndex: number) {
		week[dayIndex].transactions = logs.filter((exp) => {
			const expDate = new Date(exp.date);
			const dayDate = week[dayIndex].date;
			return expDate.toDateString() == dayDate.toDateString();
		});
	}

	function fillWeek(offset: number = 0) {
		const week: Day[] = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
			date: addDays(calendarDate.current, i - calendarDate.current.getDay() + offset),
			transactions: [],
		}));

		for (let i = 0; i < calendarDate.current.getDay(); i++) fillDay(week, i);
		for (let i = calendarDate.current.getDay(); i < 7; i++) fillDay(week, i);
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
	};

  const shiftWeeks = (direction: number) => {
		calendarDate.current = addDays(calendarDate.current, direction * 7);
		initWeeks();
	};

	const processWheel = (e: React.WheelEvent) => {
		e.preventDefault();
		if (e.deltaY > 0) shiftWeeks(1);
		else shiftWeeks(-1);
	};

	useEffect(() => {
		initWeeks();
	}, [logs, calendarDate.current]);


  return (
    <>
      <menu className='h-8 flex flex-row justify-between bg-panel ' onWheel={processWheel}>
        <li className='flex flex-row justify-center items-center '>
          <button onClick={() => shiftWeeks(-1)}><img src='/misc/previous.svg' /></button>

          <select 
            value={calendarDate.current.getMonth()}
            onChange={(e) => {
							calendarDate.current = new Date(
								new Date(calendarDate.current.setMonth(Number(e.target.value))).setDate(7),
							);
							initWeeks();
						}}
          >
            {Month.map((month, index) => (
							<option key={index} value={index}>
								{month}
							</option>
						))}
          </select>

          <select 
            value={calendarDate.current.getFullYear()}
            onChange={(e) => {
							calendarDate.current = new Date(calendarDate.current.setFullYear(Number(e.target.value)));
							initWeeks();
						}}
          >
            {yearRange.map((year, index) => (
							<option key={index} value={year}>
								{year}
							</option>
						))}
          </select>

          <button onClick={() => shiftWeeks(1)}><img src='/misc/next.svg' /></button>
        </li>

        <li className='flex flex-row justify-center items-center '>
          <button className='bg-light2 rounded-lg px-1 mr-2 hover:opacity-75' onClick={() => {
						calendarDate.current = currentDate.current;
						initWeeks();
					}}>{currentDate.current.toDateString().slice(4)}</button>
        </li>
      </menu>

      <table className='w-full h-[calc(100vh-5rem)] '>
        <thead className='h-8'>
          <tr className='bg-panel '>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody className='w-full h-[calc(100vh-7rem)]'>
          {weeks.map((week, i) => (
						<tr key={i} className='h-1/5 w-full overflow-hidden '>
							{week.map((day, index) => (
								<td className='w-[calc(14.28%)] min-w-[calc(14.28%)] h-[calc((100vh-7rem)/5)] border border-bbgray1 border-solid overflow-hidden ' key={index} onClick={() => {/*updateSelectedDays(day)*/}}>
									<div className='flex flex-col justify-start items-end w-full h-full max-h-[calc(((100vh-7rem)/5))] overflow-hidden '>
										<span
											className='flex flex-col justify-center items-center rounded-xl px-0.5 '
											style={
												day.date.toDateString() === currentDate.current.toDateString()
													? todayStyle
													: undefined
											}
										>
											{day.date.getDate()}
										</span>
										<div className='overflow-hidden overflow-y-auto w-full h-full'>
											{day.transactions.map((trans, index) => (
												<span
													className={(!['Transfer', 'Credit'].includes(trans.category.split('>')[1]) ? (trans.amount < 0 ? 'bg-negative2 ' : 'bg-primary3 '): 'bg-neutral2 ') + 'text-sm rounded-lg flex flex-row overflow-hidden hover:opacity-75 border-dashed border-2 ' + (selectLogs.includes(trans.id) ? 'border-neutral1 ' : (!['Transfer', 'Credit'].includes(trans.category.split('>')[1]) ? (trans.amount < 0 ? 'border-negative2 ' : 'border-primary3 '): 'border-neutral2 '))}
													key={index}
													onClick={(e) => {
														updateSelected(trans.id);
														e.stopPropagation();
													}}
												>
													{' '}
													{trans.amount < 0 ? '-' : '+'}${Math.abs(trans.amount / 100)}{' '}
													{trans.store}
												</span>
											))}
										</div>
									</div>
								</td>
							))}
						</tr>
					))}
        </tbody>
      </table>

      { selectLogs.length === 1 &&
        <ViewLog transaction={selected[0]} account={accounts.find(a => a.id === selected[0].account_id)!} update={update} close={() => setSelectLogs([])} />
      }

      { selectLogs.length > 1 &&
        <ViewMultiLog transactions={selected} accounts={accounts} type={selectedType} update={update} close={() => setSelectLogs([])} />
      }

    </>
  )
}

const Month = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];


interface Day {
	date: Date;
	transactions: Transaction[];
}

const todayStyle = {
	backgroundColor: '#69a6c1',
	border: `2px solid rgb(106, 146, 185)`,
	fontWeight: '600',
	color: '#fff',
};
