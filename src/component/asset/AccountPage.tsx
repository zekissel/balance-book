import { useState, useMemo } from "react";
import { Account, Transaction, AccountType } from "../../typedef";
import { addDays } from "../../typeassist";
import '../../styles/AccountPage.css';
import ReactECharts from "echarts-for-react";
import { EditAccount } from "./EditAccount";


interface AccountPageProps { accounts: Account[], transactions: Transaction[], updateAccounts: () => void }
export default function AccountPage ({ accounts, transactions, updateAccounts }: AccountPageProps) {

  return (
    <div className='page-main'>

      <ul className='assets-main-list'>
        { accounts.map((a, i) => 
          <AccountCard 
            key={i} 
            account={a} 
            updateAccount={updateAccounts} 
            transactions={transactions.filter(t => (t.account_id === a.id || t.secondary_id === a.id))} />
        )}
        { accounts.length === 0 && <div className='assets-account-card'>No accounts found</div> }
      </ul>

    </div>
  );
}


interface AccountCardProps { account: Account, updateAccount: () => void, transactions: Transaction[] }
function AccountCard ({ account, updateAccount, transactions }: AccountCardProps) {

  const [range, setRange] = useState(account.account_type === AccountType.Checking ? 14 : 91);
  const [showEdit, setShowEdit] = useState(false);
  const toggleEdit = () => setShowEdit(!showEdit);

  interface SeriesDay { date: Date, total: number }
  const timeFrameTotals = useMemo(() => {
    const today = new Date(new Date().toDateString());
    let totals: SeriesDay[] = Array.from({ length: range+1 }, (_, i) => { return { date: addDays(today, -i), total: account.balance } });
    const minTime = addDays(today, -range).getTime();
    
    transactions.forEach(trans => {
      if (trans.date.getTime() >= minTime) {
        let index = totals.findIndex((t) => t.date.toDateString() === trans.date.toDateString());
        if (index !== -1) {
          while (index < range) {
            index += 1;
            totals[index].total += ((trans.account_id === account.id ? -1 : 1) * trans.amount);
          }
        }
        else if (trans.date.getTime() > today.getTime()) {
          index = range;
          while (index > -1) {
            totals[index].total += ((trans.account_id === account.id ? -1 : 1) * trans.amount);
            index -= 1;
          }
        }
      }
    })

    return totals.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions, range, account.balance]);

  const upcomingTransactions = useMemo(() => {
    const now = new Date().getTime();
    return transactions.filter(t => t.date.getTime() > now);
  }, [transactions]);

  const option = {
    color: ['#739d88'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      formatter: '<b>{b}</b><br/>${c}'
    },
    grid: { show: true },
    xAxis: {
      type: 'category',
      interval: 0,
      data: timeFrameTotals.map((t) => new Object({ value: t.date.toDateString().slice(4, 10), label: {show: true} })),
      axisLabel: {
        rotate: 28,
        interval: range === 14 ? 0 : (range < 180 ? 4 : 20),
      },
      splitLine: { show: true, lineStyle: { color: '#ffffff', }},
    },
    yAxis: {
      type: 'value',
      splitLine: { show: true, lineStyle: { color: '#ffffff', }},
    },
    series: [
      {
        data: timeFrameTotals.map((t, i) => new Object({value: t.total / 100, label: {show:range==14?true:(range < 180 ?(i%5==0):(i%20==0)), position: i % 2 == 0 ? 'top' : 'bottom',formatter: '${c}'} })),
        type: 'line',
        step: 'end',
      }
    ],
    title: {
      text: 'Account Balance by Day'
    },
    width: '87%',
    height: '70%',
    dataZoom: { type: 'inside' },
  };

  return (
    <div className="assets-account-card">
      <div className='account-info-wrapper'>
        <div className='account-info'>
          { showEdit && <EditAccount log={account} type={account.account_type} toggle={toggleEdit} cancel={toggleEdit} updateAccounts={updateAccount} /> }
          { !showEdit &&
            <div className='account-details'>
              <h4>{ account.account_name }</h4>
              <div className='account-card-balance'>${ account.balance / 100 }</div>
              <i>{ account.account_type }</i>
            </div>
          }
          {upcomingTransactions.length > 0 && <div>Upcoming: 
            { upcomingTransactions.map(t => <span>{(t.account_id === account.id ? 1 : -1) * t.amount / 100}</span>) }
          </div>}
          { !showEdit && 
            <div className='edit-account'>
              <button onClick={() => toggleEdit()}><i>Adjust</i></button>
            </div>
          }
        </div>
        <div>
          <label>Days: </label>
          <button onClick={() => setRange(account.account_type === AccountType.Checking ? 14 : 91)}>{ account.account_type === AccountType.Checking ? '14' : '91' }</button>
          <button onClick={() => setRange(account.account_type === AccountType.Checking ? 30 : 180)}>{ account.account_type === AccountType.Checking ? '30' : '180' }</button>
          <button onClick={() => setRange(account.account_type === AccountType.Checking ? 60 : 365)}>{ account.account_type === AccountType.Checking ? '60' : '365' }</button>
        </div>
      </div>
      <div className='stats-graph'>
        <ReactECharts option={option} />
      </div>
    </div>
  );
}