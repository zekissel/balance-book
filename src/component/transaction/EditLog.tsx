import { invoke } from "@tauri-apps/api/tauri";
import React, { useState, useEffect, useMemo } from "react";
import { Category, Expense, Income, IncomeCategory, isExpense, UpdateLogProps, getEnumKeys, Account, AccountType, getAccounts } from "../../typedef";


interface EditLogProps { log: Expense | Income | null, toggle: () => void, cancel: () => void, isIncome: boolean, updateLog: UpdateLogProps }
export function EditLog ({ log, toggle, cancel, isIncome, updateLog }: EditLogProps) {

  const [store, setStore] = useState(log ? (isExpense(log) ? log.store : log.source) : '');
  const [amount, setAmount] = useState(log ? String(log.amount / 100) : '0');
  const [category, setCategory] = useState(log && isExpense(log) ? log.category : Category.None);
  const [incomeCategory, setIncomeCategory] = useState(log && !isExpense(log) ? log.category : IncomeCategory.None);
  const [desc, setDesc] = useState(log ? log.desc : '');
  const [date, setDate] = useState(log ? log.date : new Date());

  const [accountId, setAccountId] = useState(log ? (isExpense(log) ? log.srcAccountId : log.destAccountId) : (localStorage.getItem('accountDefault') ?? ''));
  const [accountId2, setAccountId2] = useState('');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const refreshAccounts = async () => { setAccounts(await getAccounts()) };

  useEffect(() => { refreshAccounts() }, []);

  const checkingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Checking), [accounts]);
  const savingsAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Savings), [accounts]);
  const investingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Investing), [accounts]);

  async function addExpense() {
    if (store === '' || amount === '0' || category === Category.None || accountId === '' || 
      ((category === Category.Investment || category === Category.Savings) && accountId2 === '' )) return;

    const data = {
      'id': log ? log.id : 0,
      'store': store,
      'amount': Math.round((Number(amount) + Number.EPSILON) * 100),
      'category': category,
      'desc': desc,
      'date': new Date(date.toDateString()),
      'accountId': accountId,
    };

    if (log) await invoke("update_expense", data);
    else {
      const newBalance = accounts.find(a => a.id === Number(accountId))!.balance - Math.round((Number(amount) + Number.EPSILON) * 100);
      await invoke("add_expense", data);
      const acctData = {
        'id': Number(accountId),
        'accountType': accounts.find(a => a.id === Number(accountId))!.account_type,
        'accountId': accounts.find(a => a.id === Number(accountId))!.account_id,
        'balance': newBalance,
        'date': new Date().toISOString(),
      };
      await invoke("update_account", acctData);
      await invoke("add_history", { 'id': Number(accountId), 'balance': newBalance, date: new Date().toISOString() });
      if (category === Category.Investment || category === Category.Savings) {
        const acctData2 = {
          'id': Number(accountId2),
          'accountType': accounts.find(a => a.id === Number(accountId2))!.account_type,
          'accountId': accounts.find(a => a.id === Number(accountId2))!.account_id,
          'balance': accounts.find(a => a.id === Number(accountId2))!.balance + Math.round((Number(amount) + Number.EPSILON) * 100),
          'date': new Date().toISOString(),
        };
        await invoke("update_account", acctData2);
        await invoke("add_history", { 'id': Number(accountId), 'balance': accounts.find(a => a.id === Number(accountId2))!.balance + Math.round((Number(amount) + Number.EPSILON) * 100), date: new Date().toISOString() });
      }
    }

    updateLog.signalExp();
    toggle();
  }

  async function addIncome () {
    if (store === '' || amount === '0' || incomeCategory === IncomeCategory.None || accountId === '' || 
      ((incomeCategory === IncomeCategory.InvestmentIncome || incomeCategory === IncomeCategory.SavingsIncome) && accountId2 === '' )) return;

    const data = {
      'id': log ? log.id : 0,
      'source': store,
      'amount': Math.round((Number(amount) + Number.EPSILON) * 100),
      'category': incomeCategory,
      'desc': desc,
      'date': new Date(date.toDateString()),
      'accountId': accountId,
    };

    if (log) await invoke("update_income", data);
    else {
      const newBalance = accounts.find(a => a.id === Number(accountId))!.balance + Math.round((Number(amount) + Number.EPSILON) * 100);
      await invoke("add_income", data);
      const acctData = {
        'id': Number(accountId),
        'accountType': accounts.find(a => a.id === Number(accountId))!.account_type,
        'accountId': accounts.find(a => a.id === Number(accountId))!.account_id,
        'balance': newBalance,
        'date': new Date().toISOString(),
      };
      await invoke("update_account", acctData);
      await invoke("add_history", { 'id': Number(accountId), 'balance': newBalance, date: new Date().toISOString() });
      if (incomeCategory === IncomeCategory.InvestmentIncome || incomeCategory === IncomeCategory.SavingsIncome) {
        const acctData2 = {
          'id': Number(accountId2),
          'accountType': accounts.find(a => a.id === Number(accountId2))!.account_type,
          'accountId': accounts.find(a => a.id === Number(accountId2))!.account_id,
          'balance': accounts.find(a => a.id === Number(accountId2))!.balance - Math.round((Number(amount) + Number.EPSILON) * 100),
          'date': new Date().toISOString(),
        };
        await invoke("update_account", acctData2);
        await invoke("add_history", { 'id': Number(accountId), 'balance': accounts.find(a => a.id === Number(accountId2))!.balance - Math.round((Number(amount) + Number.EPSILON) * 100), date: new Date().toISOString() });
      }
    }
    
    updateLog.signalInc();
    toggle();
  }

  const deleteTransaction = () => {
    if (log && isIncome) {
      invoke("delete_income", { 'id': log.id });
      updateLog.signalInc();
    }
    else if (log && !isIncome) {
      invoke("delete_expense", { 'id': log.id });
      updateLog.signalExp();
    }
    toggle();
  }

  const updateAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
    if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmount(am);
    }
  }

  return (
    <fieldset className={isIncome ? 'new-trans new-trans-income' : 'new-trans new-trans-expense'}>
      <legend>{ log ? 'Edit' : 'New' }{ isIncome ? ` Income` : ` Expense` }</legend>

      <div className='new-trans-main'>
        <li><label>{ isIncome ? `Source`: `Store`}: </label><input type='text' value={store} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStore(e.target.value)}/></li>
        <li><label>Amount: </label><input type='text' value={amount} onChange={updateAmount}/></li>
      </div>
      
      <li className='new-trans-detail'>
        { isIncome ?
          <select value={incomeCategory} onChange={(e) => setIncomeCategory(IncomeCategory[e.target.value as keyof typeof IncomeCategory])}>
            {getEnumKeys(IncomeCategory).map((key, index) => (
              <option key={index} value={IncomeCategory[key]}>
                {IncomeCategory[key]}
              </option>
            ))}
          </select>
          :
          <select value={category} onChange={(e) => setCategory(Category[e.target.value as keyof typeof Category])}>
            {getEnumKeys(Category).map((key, index) => (
              <option key={index} value={Category[key]}>
                {Category[key]}
              </option>
            ))}
          </select>
        }
        <input className='date-pick' type='date' value={date.toISOString().substring(0, 10)} onChange={(e) => {
          setDate(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')));
          }} />
      </li>
      <li><label>{ isIncome ? 'Destination' : 'Source' }: </label>
          <select value={accountId} onChange={(e) => {setAccountId(e.target.value); setAccountId2('')}}>
            <option value=''>Select Account</option>
              {
                checkingAccounts.map((a, index) => (
                  <option key={index} value={a.id}>{a.account_type}:{a.account_id}</option>
              ))}
          </select>
      </li>
      { (isIncome && incomeCategory === IncomeCategory.InvestmentIncome || incomeCategory === IncomeCategory.SavingsIncome) &&
        <li><label>Source: </label>
          <select value={accountId2} onChange={(e) => setAccountId2(e.target.value)}>
            <option value=''>Select Account</option>
            { ( incomeCategory === IncomeCategory.InvestmentIncome ? investingAccounts : savingsAccounts).map((a, index) => (
              <option key={index} value={a.id}>{a.account_type}:{a.account_id}</option>
            ))}
          </select>
        </li>
      }
      { (!isIncome && category === Category.Investment || category === Category.Savings) &&
        <li>
          <label>Destination: </label>
          <select value={accountId2} onChange={(e) => setAccountId2(e.target.value)}>
            <option value=''>Select Account</option>
            { (category === Category.Savings ? savingsAccounts : investingAccounts).map((a, index) => (
              <option key={index} value={a.id}>{a.account_type}:{a.account_id}</option>
            ))}
          </select>
        </li>
      }

      <li className='new-trans-desc'><label>Description: </label><textarea value={desc} onChange={(e) => setDesc(e.target.value)}></textarea></li>
      
      <li className='new-trans-meta'>
        <button className='new-trans-submit' onClick={isIncome ? addIncome : addExpense}>Submit</button>
        <button onClick={cancel}>Cancel</button>
        { log && <button className='delete-trans' onClick={deleteTransaction}>Delete</button> }
      </li>
      
      
    </fieldset>
  );
}