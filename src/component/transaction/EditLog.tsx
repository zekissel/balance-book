import { invoke } from "@tauri-apps/api/tauri";
import React, { useState, useEffect, useMemo } from "react";
import { Transaction, IncomeCat, ExpenseCat, getEnumKeys, Account, AccountType } from "../../typedef";
import { getAccounts } from "../../typeassist";


interface EditLogProps { log: Transaction | null, toggle: () => void, cancel: () => void, isIncome: boolean, updateLog: () => void }
export function EditLog ({ log, updateLog, isIncome, toggle, cancel }: EditLogProps) {

  const [company, setCompany] = useState(log ? log.company : '');
  const [amount, setAmount] = useState(log ? String(log.amount / 100) : '0');
  const [category, setCategory] = useState(log ? log.category : ( isIncome ? IncomeCat.None : ExpenseCat.None));
  const [date, setDate] = useState(log ? log.date : new Date(new Date().toDateString()));
  const [desc, setDesc] = useState(log ? log.desc : '');

  const [accountId, setAccountId] = useState(log ? (String(log.account_id)) : (localStorage.getItem('accountDefault') ?? ''));
  const [accountId2, setAccountId2] = useState(log ? (String(log.secondary_id)) : '');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const refreshAccounts = async () => { setAccounts(await getAccounts()) };
  useEffect(() => { refreshAccounts() }, []);

  const checkingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Checking), [accounts]);
  const savingsAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Savings), [accounts]);
  const investingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Investing), [accounts]);

  function addTransaction() {
    if ((!isInternal() && company === '') || amount === '0' || accountId === '') return;
    if (category === ExpenseCat.None || category === IncomeCat.None) return;
    if (accountId2 === '' && isInternal()) return

    const party = isInternal() ? `${accounts.find(a => a.id === Number(accountId2))!.account_type}:${accounts.find(a => a.id === Number(accountId2))!.account_name}` : company;
    const transactionData = {
      'id': log ? log.id : undefined,
      'company': party,
      'amount': (isIncome ? 1 : -1) * Math.round((Number(amount) + Number.EPSILON) * 100),
      'category': category,
      'date': new Date(date.toDateString()),
      'desc': desc,
      'accountId': Number(accountId),
      'secondaryId': accountId2 === '' ? null : Number(accountId2),
    };

    if (log !== null) {
      invoke('fix_transaction', transactionData);
      // edit account based on transaction

    } else {
      invoke('new_transaction', transactionData);
      const accountData = {
        'id': Number(accountId),
        'accountType': accounts.find(a => a.id === Number(accountId))!.account_type,
        'accountId': accounts.find(a => a.id === Number(accountId))!.account_name,
        'balance': accounts.find(a => a.id === Number(accountId))!.balance + (( isIncome ? 1 : -1) * Math.round((Number(amount) + Number.EPSILON) * 100)),
        'date': new Date().toISOString(),
      };
      invoke("fix_account", accountData);
      if (accountId2 !== '') {
        const accountData2 = {
          'id': Number(accountId2),
          'accountType': accounts.find(a => a.id === Number(accountId2))!.account_type,
          'accountId': accounts.find(a => a.id === Number(accountId2))!.account_name,
          'balance': accounts.find(a => a.id === Number(accountId2))!.balance + (( isIncome ? -1 : 1) * Math.round((Number(amount) + Number.EPSILON) * 100)),
          'date': new Date().toISOString(),
        };
        invoke("fix_account", accountData2);
      }
    }

    updateLog();
    toggle();
  }

  const deleteTransaction = () => {
    if (!log) return;

    invoke("remove_transaction", { 'id': log.id });
    updateLog();

    const accountData = {
      'id': Number(accountId),
      'accountType': accounts.find(a => a.id === Number(accountId))!.account_type,
      'accountId': accounts.find(a => a.id === Number(accountId))!.account_name,
      'balance': accounts.find(a => a.id === Number(accountId))!.balance + (( isIncome ? -1 : 1) * Math.round((Number(amount) + Number.EPSILON) * 100)),
      'date': new Date().toISOString(),
    };
    invoke("fix_account", accountData);
  }

  const updateAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
    if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmount(am);
    }
  }

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isIncome) setCategory(IncomeCat[e.target.value as keyof typeof IncomeCat]);
    else setCategory(ExpenseCat[e.target.value as keyof typeof ExpenseCat]);

    if (e.target.value === ExpenseCat.Investment || e.target.value === IncomeCat.InvestmentIncome) setAccountId2(String(log?.secondary_id) ?? (localStorage.getItem('accountInvesting') ?? ''));
    else if (e.target.value === ExpenseCat.Savings || e.target.value === IncomeCat.SavingsIncome) setAccountId2(localStorage.getItem('accountSavings') ?? '');
  }

  const isInternal = (): Boolean => { return (category === IncomeCat.SavingsIncome || category === ExpenseCat.Savings || category === IncomeCat.InvestmentIncome || category === ExpenseCat.Investment) }

  return (
    <fieldset className={isIncome ? 'new-trans new-trans-income' : 'new-trans new-trans-expense'}>
      <legend>{ log ? 'Edit' : 'New' }{ isIncome ? ` Income` : ` Expense` }</legend>

      <div className='new-trans-main'>
        <li><label>{ isIncome ? `Source`: `Payee`}: </label>
          { !isInternal() && <input type='text' value={company} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}/> }
          { isInternal() &&
            <select value={accountId2} onChange={(e) => setAccountId2(e.target.value)}>
              <option value=''>Select Account</option>
              
              { ((category === IncomeCat.InvestmentIncome || category === ExpenseCat.Investment) ? investingAccounts : savingsAccounts).map((a, index) => (
                <option key={index} value={String(a.id)}>{a.account_type}:{a.account_name}</option>
              ))}
            </select>
          }
        </li>
        <li><label>Amount: </label><input type='text' value={amount} onChange={updateAmount}/></li>
      </div>
      
      <li className='new-trans-detail'>
        { isIncome ?
          <select value={category} onChange={handleCategorySelect}>
            {getEnumKeys(IncomeCat).map((key, index) => (
              <option key={index} value={IncomeCat[key]}>
                {IncomeCat[key]}
              </option>
            ))}
          </select>
          :
          <select value={category} onChange={handleCategorySelect}>
            {getEnumKeys(ExpenseCat).map((key, index) => (
              <option key={index} value={ExpenseCat[key]}>
                {ExpenseCat[key]}
              </option>
            ))}
          </select>
        }
        <input className='date-pick' type='date' value={date.toISOString().substring(0, 10)} onChange={(e) => {
          setDate(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')));
          }} />
      </li>
      <li><label>{ isIncome ? 'Destination' : 'Source' }: </label>
          <select value={accountId} onChange={(e) => { setAccountId(e.target.value) }}>
            <option value=''>Select Account</option>
              {
                ( isIncome ? accounts : checkingAccounts).map((a, index) => (
                  <option key={index} value={String(a.id)}>{a.account_type}:{a.account_name}</option>
              ))}
          </select>
      </li>

      <li className='new-trans-desc'><label>Description: </label><textarea value={desc} onChange={(e) => setDesc(e.target.value)}></textarea></li>
      
      <li className='new-trans-meta'>
        <button className='new-trans-submit' onClick={addTransaction}>Submit</button>
        <button onClick={cancel}>Cancel</button>
        { log && <button className='delete-trans' onClick={deleteTransaction}>Delete</button> }
      </li>
      
    </fieldset>
  );
}