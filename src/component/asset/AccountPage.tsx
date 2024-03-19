import { useState, useMemo, useEffect } from "react";
import { Account, Income, Expense, isExpense } from "../../typedef";
import '../../styles/AccountPage.css';
import { getIncome, getExpenses } from "../../typeassist";
import ReactECharts from "echarts-for-react";
import { EditAccount } from "./EditAccount";


interface AccountPageProps { accounts: Account[], updateAccounts: () => void }
export default function AccountPage ({ accounts, updateAccounts }: AccountPageProps) {

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const refreshExpenses = async () => { setExpenses(await getExpenses()) };
  const refreshIncome = async () => { setIncome(await getIncome()) };
  useEffect(() => {
    refreshExpenses();
    refreshIncome();
  }, [])
  const transactions = useMemo(() => {
    let transactions: (Expense | Income)[] = [];
    return transactions.concat(expenses).concat(income).sort((a, b) => a.date > b.date ? -1 : 1);
  }, [expenses, income]);

  return (
    <div className='assets-main'>

      <ul className='assets-main-list'>
        { accounts.map((a, i) => <AccountCard key={i} account={a} updateAccount={updateAccounts} transactions={transactions.filter(t => t.account_id === a.id)} />) }
        { accounts.length === 0 && <li>No accounts found</li> }
      </ul>

    </div>
  );
}


interface AccountCardProps { account: Account, updateAccount: () => void, transactions: (Expense | Income)[] }
function AccountCard ({ account, updateAccount, transactions }: AccountCardProps) {

  const [range, setRange] = useState(14);
  const [showEdit, setShowEdit] = useState(false);
  const toggleEdit = () => setShowEdit(!showEdit);

  interface SeriesDay { date: Date, total: number }
  const timeFrameTotals = useMemo(() => {
    let totals: SeriesDay[] = Array.from({ length: range }, (_, i) => { return { date: new Date(new Date().getTime() - (i * 24 * 60 * 60 * 1000)), total: account.balance } });
    const minTime = new Date(new Date().getTime() - (range * 24 * 60 * 60 * 1000)).getTime();
    transactions.forEach(trans => {
      if (trans.date.getTime() >= minTime) {
        let index = totals.findIndex((t) => t.date.toDateString() === trans.date.toDateString());
        if (index !== -1) {
          while (index < range - 1) {
            index += 1;
            totals[index].total += ((isExpense(trans) ? 1 : -1) * trans.amount);
          }
        }
      }
    })
    return totals.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions, range, account.balance]);

  const option = {
    color: ['#739d88'],
    grid: { show: true },
    xAxis: {
      type: 'category',
      interval: 0,
      data: timeFrameTotals.map((t) => new Object({ value: t.date.toDateString().slice(4, range >= 100 ? 15 : 10), label: {show: true} })),
      axisLabel: {
        rotate: 28,
        interval: 0,
      },
      splitLine: { show: true, lineStyle: { color: '#ffffff', }},
    },
    yAxis: {
      type: 'value',
      splitLine: { show: true, lineStyle: { color: '#ffffff', }},
    },
    series: [
      {
        data: timeFrameTotals.map((t, i) => new Object({value: t.total / 100, label: {show:true, position: i % 2 == 0 ? 'top' : 'bottom',formatter: '${c}'} })),
        type: 'line',
        step: 'end',
      }
    ],
    title: {
      text: 'Account Balance by Day'
    },
    width: '87%',
    height: range >= 100 ? '64%' : '70%',
    dataZoom: { type: 'inside' },
  };

  return (
    <li>
      <div className='assets-account-card'>
        

        <div className='account-info'>
          { showEdit && <EditAccount log={account} type={account.account_type} toggle={toggleEdit} cancel={toggleEdit} updateAccounts={updateAccount} /> }
          { !showEdit &&
            <>
              <button onClick={() => toggleEdit()}><img src='/edit.svg'/></button>
              <h4>{ account.account_name }</h4>
              <i>{ account.account_type }</i>
              <p>${ account.balance / 100 }</p>
              <input type='number' value={range} onChange={(e) => setRange(Number(e.target.value))} />
            </>
          }
          
        </div>
        <div className='stats-graph'>
          <ReactECharts option={option} />
        </div>
      </div>
    </li>
  );
}