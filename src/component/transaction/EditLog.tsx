import { invoke } from "@tauri-apps/api/tauri";
import React, { useState, useMemo, useEffect } from "react";
import { Transaction, IncomeRoot, IncomeLeaf, ExpenseRoot, ExpenseLeaf, getEnumKeys, Account, AccountType } from "../../typedef";


interface EditLogProps { log: Transaction | null, accounts: Account[], toggle: () => void, cancel: () => void, isIncome: boolean, updateLog: () => void }
export function EditLog ({ log, accounts, updateLog, isIncome, toggle, cancel }: EditLogProps) {

  const [company, setCompany] = useState(log ? log.company : '');
  const [amount, setAmount] = useState(log ? String(log.amount / 100) : '0');
  const displayAmount = useMemo(() => `${(Math.abs(Number(amount)))}${amount.charAt(amount.length - 1) === '.' ? '.' : ''}${(amount.charAt(amount.length - 2) === '.' && amount.charAt(amount.length - 1) === '0') ? '.0' : ''}`, [amount]);
  const [category, setCategory] = useState(log ? log.category : ( isIncome ? `OtherIncome>Other` : `Other>Other`));
  const [date, setDate] = useState(log ? log.date : new Date(new Date().toDateString()));
  const [desc, setDesc] = useState(log ? log.desc : '');

  const [accountId, setAccountId] = useState(log ? (String(log.account_id)) : (localStorage.getItem('accountDefault') ?? ''));
  const [accountId2, setAccountId2] = useState(log ? (String(log.secondary_id)) : '');

  const [isIncomeState, setIsIncomeState] = useState(isIncome);
  useEffect(() => setIsIncomeState(isIncome), [isIncome]);

  const checkingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Checking), [accounts]);
  const savingsAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Savings), [accounts]);
  const investingAccounts = useMemo(() => accounts.filter(a => a.account_type === AccountType.Investing), [accounts]);

  const accountError = useMemo(() => !isIncome ? (checkingAccounts.length === 0 ? '*Expense requires a source account' : '') : (accounts.length === 0 ? '*Income requires a destination account' : ''), [isIncome]);
  const [error, setError] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(timer);
  }, [error]);


  async function addTransaction() {
    if (!isInternal() && company === '') { setError('Company/Payee required'); return;} 
    if (amount === '0' || accountId === '') { setError('Account and amount required'); return; }
    if (accountId2 === '' && isInternal()) { setError('Specify secondary account'); return; }

    const party = isInternal() ? `${accounts.find(a => a.id === accountId2)!.account_type}:${accounts.find(a => a.id === accountId2)!.account_name}` : company;
    const balanceAdjustor = Number(amount) < 0 ? (isIncomeState ? -1 : 1) : (isIncomeState ? 1 : -1);
    const transactionData = {
      'id': log ? log.id : undefined,
      'company': party,
      'amount': Math.round((Number(amount) + Number.EPSILON) * 100) * balanceAdjustor,
      'category': category,
      'date': new Date(date.toDateString()),
      'desc': desc,
      'accountId': accountId,
      'secondaryId': accountId2 === '' ? undefined : accountId2,
    };

    if (log !== null) {
      invoke('fix_transaction', transactionData);
      // edit account based on transaction

    } else {
      await invoke('new_transaction', transactionData);
      const accountData = {
        'id': Number(accountId),
        'userId': accounts.find(a => a.id === accountId)!.user_id,
        'accountType': accounts.find(a => a.id === accountId)!.account_type,
        'accountId': accounts.find(a => a.id === accountId)!.account_name,
        'balance': accounts.find(a => a.id === accountId)!.balance + (( isIncomeState ? 1 : -1) * Math.round((Number(amount) + Number.EPSILON) * 100)),
        'date': new Date().toISOString(),
      };
      await invoke("fix_account", accountData);
      if (accountId2 !== '') {
        const accountData2 = {
          'id': Number(accountId2),
          'userId': accounts.find(a => a.id === accountId2)!.user_id,
          'accountType': accounts.find(a => a.id === accountId2)!.account_type,
          'accountId': accounts.find(a => a.id === accountId2)!.account_name,
          'balance': accounts.find(a => a.id === accountId2)!.balance + (( isIncomeState ? -1 : 1) * Math.round((Number(amount) + Number.EPSILON) * 100)),
          'date': new Date().toISOString(),
        };
        await invoke("fix_account", accountData2);
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
      'accountType': accounts.find(a => a.id === accountId)!.account_type,
      'accountId': accounts.find(a => a.id === accountId)!.account_name,
      'balance': accounts.find(a => a.id === accountId)!.balance + (( isIncomeState ? -1 : 1) * Math.round((Number(amount) + Number.EPSILON) * 100)),
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
    if (isIncomeState) setCategory(e.target.value as typeof category);
    else setCategory(e.target.value as typeof category);
    
    if ( e.target.value.split('>').length > 1 &&
      (`${ExpenseRoot.Financial}` === e.target.value.split('>')[1] || 
      e.target.value === `${IncomeRoot.FinanceIncome}`)
    ) {
      // use logs secondary id, or default. if investing inc/exp, use investing accounts, else use savings
      setAccountId2(String(log?.secondary_id) ?? (localStorage.getItem('accountInvesting') ?? ''));
      setAccountId2(localStorage.getItem('accountSavings') ?? '');
    } 
  }

  const isInternal = (): Boolean => { return (category.split('>')[0] === `${IncomeRoot.FinanceIncome}` || category.split('>')[0] === `${ExpenseRoot.Financial}`) && (category.split('>').length > 1) && (category.split('>')[1] === 'Investment' || category.split('>')[1] === 'Savings') }

  return (
    <fieldset className={isIncomeState ? 'new-trans new-trans-income' : 'new-trans new-trans-expense'}>
      <legend>{ log ? 'Edit' : 'New' }{ isIncomeState ? ` Income` : ` Expense` }</legend>

      <div className='new-trans-main'>
        <li><label>{ isIncomeState ? `Source`: `Payee`}: </label>
          { !isInternal() && 
            <input type='text' value={company} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}/> 
          }
          { isInternal() &&
            <select value={accountId2} onChange={(e) => setAccountId2(e.target.value)}>
              <option value=''>Select Account</option>
              
              { (((category.split('>').length > 1) && (category.split('>')[1] === 'Investment')) ? investingAccounts : savingsAccounts).map((a, index) => (
                <option key={index} value={String(a.id)}>{a.account_type}:{a.account_name}</option>
              ))}
            </select>
          }
        </li>
        <li><label>Amount: </label><input type='text' value={displayAmount} onChange={updateAmount}/></li>
      </div>
      
      <li className='new-trans-detail'>

        { isIncomeState ?
          <select value={`${category}`} onChange={handleCategorySelect}>
            {getEnumKeys(IncomeRoot).map((key, index) => (
              <optgroup key={index} label={key}>
                {IncomeLeaf[key].map((leaf, index) => (
                  <option key={index} value={`${key}>${leaf}`}>
                    {`> ${leaf}`}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          :
          <select value={`${category}`} onChange={handleCategorySelect}>
            {getEnumKeys(ExpenseRoot).map((key, index) => (
              <optgroup key={index} label={key}>
                {ExpenseLeaf[key].map((leaf, index) => (
                  <option key={index} value={`${key}>${leaf}`}>
                    {`> ${leaf}`}
                  </option>
                ))}
            </optgroup>
            ))}
          </select>
        }
        <input className='date-pick' type='date' value={date.toISOString().substring(0, 10)} onChange={(e) => {
          setDate(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')));
          }} />
      </li>
      <li><label>{ isIncomeState ? 'Destination' : 'Source' }: </label>
          <select value={accountId} onChange={(e) => { setAccountId(e.target.value) }}>
            <option value=''>Select Account</option>
              {
                ( isIncomeState ? accounts : checkingAccounts).map((a, index) => (
                  <option key={index} value={String(a.id)}>{a.account_type}:{a.account_name}</option>
              ))}
          </select>
      </li>

      <li className='new-trans-desc'><label>Description: </label><textarea value={desc} onChange={(e) => setDesc(e.target.value)}></textarea></li>
      
      <li className='new-trans-meta'>
        <button className='new-trans-submit' onClick={addTransaction}>Submit</button>
        { log && <button onClick={() => setIsIncomeState(!isIncomeState)}>{ isIncomeState ? `Expense` : `Income` }</button> }
        <button onClick={cancel}>Cancel</button>
        { log && <button className='delete-trans' onClick={deleteTransaction}>Delete</button> }
      </li>

      { accountError !== '' && <li><>{ accountError }</></li> }
      { error !== '' && <li><>{ error }</></li> }
      
    </fieldset>
  );
}