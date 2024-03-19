import { invoke } from "@tauri-apps/api/tauri";
import React, { useState, useEffect, useMemo } from "react";
import { Category, Expense, Income, IncomeCategory, isExpense, UpdateLogProps, getEnumKeys, Account, AccountType } from "../../typedef";
import { getAccounts } from "../../typeassist";


interface EditLogProps { log: Expense | Income | null, toggle: () => void, cancel: () => void, isIncome: boolean, updateLog: UpdateLogProps }
export function EditLog ({ log, toggle, cancel, isIncome, updateLog }: EditLogProps) {

  const [store, setStore] = useState(log ? (isExpense(log) ? log.store : log.source) : '');
  const [amount, setAmount] = useState(log ? String(log.amount / 100) : '0');
  const [category, setCategory] = useState(log && isExpense(log) ? log.category : Category.None);
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>(log && !isExpense(log) ? log.category : IncomeCategory.None);
  const [desc, setDesc] = useState(log ? log.desc : '');
  const [date, setDate] = useState(log ? log.date : new Date());

  const [accountId, setAccountId] = useState(log !== null ? (String(log.account_id)) : (localStorage.getItem('accountDefault') ?? ''));
  const [accountId2, setAccountId2] = useState('');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const refreshAccounts = async () => { setAccounts(await getAccounts()) };

  useEffect(() => { refreshAccounts() }, []);

  const checkingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Checking), [accounts]);
  const savingsAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Savings), [accounts]);
  const investingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Investing), [accounts]);

  async function addTransaction() {
    if (store === '' || amount === '0' || accountId === '') return;
    if (isIncome) { if (incomeCategory === IncomeCategory.None || ([IncomeCategory.SavingsIncome, IncomeCategory.InvestmentIncome].includes(incomeCategory) && accountId2 === '')) return; }
    else { if (category === Category.None || ([Category.Savings, Category.Investment].includes(category) && accountId2 === '')) return; }

    const transactionData = {
      'id': log ? log.id : undefined,
      'source': store,
      'store': store,
      'amount': Math.round((Number(amount) + Number.EPSILON) * 100),
      'category': isIncome ? incomeCategory : category,
      'desc': desc,
      'date': new Date(date.toDateString()),
      'accountId': Number(accountId),
    };

    if (log !== null) {
      await invoke(isIncome ? "update_income" : "update_expense", transactionData);
    } else {
      await invoke(isIncome ? "add_income" : "add_expense", transactionData);
      const accountData = {
        'id': Number(accountId),
        'accountType': accounts.find(a => a.id === Number(accountId))!.account_type,
        'accountId': accounts.find(a => a.id === Number(accountId))!.account_name,
        'balance': accounts.find(a => a.id === Number(accountId))!.balance + (( isIncome ? 1 : -1) * Math.round((Number(amount) + Number.EPSILON) * 100)),
        'date': new Date().toISOString(),
      };
      await invoke("update_account", accountData);
      if ((isIncome && (incomeCategory === IncomeCategory.SavingsIncome || incomeCategory === IncomeCategory.InvestmentIncome) ||
          (!isIncome && (category === Category.Savings || category === Category.Investment)))) {
        const accountData2 = {
          'id': Number(accountId2),
          'accountType': accounts.find(a => a.id === Number(accountId2))!.account_type,
          'accountId': accounts.find(a => a.id === Number(accountId2))!.account_name,
          'balance': accounts.find(a => a.id === Number(accountId2))!.balance + (( isIncome ? -1 : 1) * Math.round((Number(amount) + Number.EPSILON) * 100)),
          'date': new Date().toISOString(),
        };
        await invoke("update_account", accountData2);
        await invoke("add_history", { 'accountId': Number(accountId2), 'balance': (isIncome ? 1 : -1) * Math.round((Number(amount) + Number.EPSILON) * 100), date: new Date(date.toDateString()) });
      }
    }

    isIncome ? updateLog.signalInc() : updateLog.signalExp();
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
    if (log) {
      const accountData = {
        'id': Number(accountId),
        'accountType': accounts.find(a => a.id === Number(accountId))!.account_type,
        'accountId': accounts.find(a => a.id === Number(accountId))!.account_name,
        'balance': accounts.find(a => a.id === Number(accountId))!.balance + (( isIncome ? -1 : 1) * Math.round((Number(amount) + Number.EPSILON) * 100)),
        'date': new Date().toISOString(),
      };
      invoke("update_account", accountData);
    }

    toggle();
  }

  const updateAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
    if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmount(am);
    }
  }

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isIncome) setIncomeCategory(IncomeCategory[e.target.value as keyof typeof IncomeCategory]);
    else setCategory(Category[e.target.value as keyof typeof Category]);
    console.log(e.target.value, Category[e.target.value as keyof typeof Category], IncomeCategory[e.target.value as keyof typeof IncomeCategory])

    if (e.target.value === Category.Investment || e.target.value === IncomeCategory.InvestmentIncome) setAccountId2(localStorage.getItem('accountInvesting') ?? '');
    else if (e.target.value === Category.Savings || e.target.value === IncomeCategory.SavingsIncome) setAccountId2(localStorage.getItem('accountSavings') ?? '');
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
          <select value={incomeCategory} onChange={handleCategorySelect}>
            {getEnumKeys(IncomeCategory).map((key, index) => (
              <option key={index} value={IncomeCategory[key]}>
                {IncomeCategory[key]}
              </option>
            ))}
          </select>
          :
          <select value={category} onChange={handleCategorySelect}>
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
                ( isIncome ? accounts : checkingAccounts).map((a, index) => (
                  <option key={index} value={String(a.id)}>{a.account_type}:{a.account_name}</option>
              ))}
          </select>
      </li>
      { isIncome && (incomeCategory === IncomeCategory.InvestmentIncome || incomeCategory === IncomeCategory.SavingsIncome) &&
        <li>
          <label>Source: </label>
          <select value={accountId2} onChange={(e) => setAccountId2(e.target.value)}>
            <option value=''>Select Account</option>
            
            { (incomeCategory === IncomeCategory.InvestmentIncome ? investingAccounts : savingsAccounts).map((a, index) => (
              <option key={index} value={String(a.id)}>{a.account_type}:{a.account_name}</option>
            ))}
          </select>
        </li>
      }
      { !isIncome && (category === Category.Investment || category === Category.Savings) &&
        <li>
          <label>Destination: </label>
          <select value={accountId2} onChange={(e) => setAccountId2(e.target.value)}>
            <option value=''>Select Account</option>
            
            { (category === Category.Investment ? investingAccounts : savingsAccounts).map((a, index) => (
              <option key={index} value={a.id}>{a.account_type}:{a.account_name}</option>
            ))}
          </select>
        </li>
      }

      <li className='new-trans-desc'><label>Description: </label><textarea value={desc} onChange={(e) => setDesc(e.target.value)}></textarea></li>
      
      <li className='new-trans-meta'>
        <button className='new-trans-submit' onClick={addTransaction}>Submit</button>
        <button onClick={cancel}>Cancel</button>
        { log && <button className='delete-trans' onClick={deleteTransaction}>Delete</button> }
      </li>
      
    </fieldset>
  );
}