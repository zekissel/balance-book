import { useMemo, useState } from "react";
import { Account, Transaction } from "../../typedef";

interface CalendarProps {
  accounts: Account[];
  transactions: Transaction[];
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function moveMonths(date: Date, offset: number) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const target = new Date(year, month + offset, 1);
  const daysInTarget = new Date(year, month + offset + 1, 0).getDate();
  target.setDate(Math.min(day, daysInTarget));
  return target;
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function normalizeDateKey(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.toISOString();
}

export default function Calendar({ transactions }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const dayGrid = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [currentDate]);

  const monthLabel = useMemo(() => {
    const refDate = dayGrid[2 * 7 + 3];
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(refDate);
  }, [dayGrid]);

  const referenceMonth = useMemo(() => {
    return dayGrid[2 * 7 + 3].getMonth();
  }, [dayGrid]);

  const transactionsByDay = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    transactions.forEach((transaction: Transaction) => {
      const key = normalizeDateKey(new Date(transaction.timestamp));
      const list = map.get(key) ?? [];
      list.push(transaction);
      map.set(key, list);
    });
    return map;
  }, [transactions]);

  const transactionsForDay = (date: Date) => {
    return transactionsByDay.get(normalizeDateKey(date)) ?? [];
  };

  return (
    <section className="calendar-shell">
      <header className="calendar-header">
        <div>
          <h2>{monthLabel}</h2>
        </div>

        <menu className="calendar-controls">
          <button type="button" onClick={() => setCurrentDate((date: Date) => moveMonths(date, -1))}>
            &lt;&lt;
          </button>
          <button type="button" onClick={() => setCurrentDate((date: Date) => addDays(date, -7))}>
            &lt;
          </button>
          <button type="button" onClick={() => setCurrentDate((date: Date) => addDays(date, 7))}>
            &gt;
          </button>
          <button type="button" onClick={() => setCurrentDate((date: Date) => moveMonths(date, 1))}>
            &gt;&gt;
          </button>
        </menu>
      </header>

      <div className="calendar-grid calendar-weekdays">
        {dayNames.map((name) => (
          <div key={name} className="calendar-weekday">
            {name}
          </div>
        ))}
      </div>

      <div className="calendar-grid calendar-days-grid">
        {dayGrid.map((day: Date) => {
          const dayTransactions = transactionsForDay(day);
          const isOtherMonth = day.getMonth() !== referenceMonth;
          return (
            <article key={day.toISOString()} className={`day-cell ${isOtherMonth ? "outside" : ""}`}>
              <div className="day-number">
                <span>{day.getDate()}</span>
                {dayTransactions.length > 0 && (
                  <span className="day-badge">{dayTransactions.length}</span>
                )}
              </div>

              <div className="day-transactions">
                {dayTransactions.slice(0, 3).map((transaction) => {
                  const amount = transaction.amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  });
                  const typeClass = transaction.amount >= 0 ? "positive" : "negative";
                  const label = transaction.store || transaction.description || "Transaction";
                  return (
                    <span key={transaction.id} className={`transaction-chip ${typeClass}`}>
                      {label}: {amount}
                    </span>
                  );
                })}

                {dayTransactions.length > 3 && (
                  <div className="more-count">+{dayTransactions.length - 3} more</div>
                )}

                {dayTransactions.length === 0 && (
                  <p className="empty-day"></p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
