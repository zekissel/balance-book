import React, { useEffect, useState } from 'react';
import { Filters, Category, IncomeCategory, getEnumKeys, Account } from '../../typedef';
import { getAccounts } from '../../typeassist';
import { addDays } from '../../typeassist';
import '../../styles/Filter.css';


interface FilterProps { toggle: () => void, filters: Filters, setFilters: React.Dispatch<React.SetStateAction<Filters>> }
export default function Filter ({ toggle, filters, setFilters }: FilterProps) {


  const [showStartDate, setShowStartDate] = useState(filters.startDate !== null);
  const toggleStartDate = () => setShowStartDate(!showStartDate);
  const [showEndDate, setShowEndDate] = useState(filters.endDate !== null);
  const toggleEndDate = () => setShowEndDate(!showEndDate);
  const [showCategory, setShowCategory] = useState(false);
  const toggleCategory = () => setShowCategory(!showCategory);

  const [accountOptions, setAccountOptions] = useState<Account[]>([]);
  const [showAccounts, setShowAccounts] = useState(false);
  const toggleAccounts = () => setShowAccounts(!showAccounts);

  const handleLowAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
    if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setFilters({ ...filters, lowAmount: am});
    }
  }
  const handleHighAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
    if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setFilters({ ...filters, highAmount: am});
    }
  }

  const resetFilters = () => {
    setFilters({ 
      type: `all`, 
      startDate: null,
      endDate: null,
      category: [],
      source: [''],
      lowAmount: '0',
      highAmount: '0', 
      accounts: [],
    });
    setShowStartDate(false);
    setShowEndDate(false);
    setShowCategory(false);
  };

  useEffect(() => {
    getAccounts().then((accounts) => setAccountOptions(accounts));
  }, []);

  return (
    <menu className='filter-menu'>

      <li>
        <label>Type: </label>
        <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value as string})} >
          <option value={`all`}>All</option>
          <option value={`expense`}>Expense</option>
          <option value={`income`}>Income</option>
        </select>
      </li>

      <li>
        <label className='filter-menu-togglable' onClick={() => { toggleStartDate(); setFilters({...filters, startDate: null}); }}>Start Date: </label>
        { showStartDate && <input type='date' value={ filters.startDate ? (addDays(filters.startDate!, 1).toISOString().substring(0, 10)) : undefined } onChange={(e) => setFilters({...filters, startDate: addDays(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')), -1)})}/> }
        { !showStartDate && <span>None</span>}
      </li>
      <li>
        <label className='filter-menu-togglable' onClick={() => { toggleEndDate(); setFilters({...filters, endDate: null}); }}>End Date: </label>
        { showEndDate && <input type='date' value={filters.endDate ? (addDays(filters.endDate!, 0).toISOString().substring(0, 10)) : undefined} onChange={(e) => setFilters({...filters, endDate: addDays(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')), 0)})} /> }
        { !showEndDate && <span>None</span>}
      </li>

      <li>
        <span className='filter-menu-heading'><label className={filters.category.length === 0 ? 'filter-menu-togglable':'filter-menu-togglable-nonempty'} onClick={() => { toggleCategory(); setFilters({...filters, category: []}) }}>Categories: </label>
          <span id='category-img' onClick={toggleCategory}>{ showCategory ? <img src='/close-up.svg' /> : <img src='/open-down.svg' /> }</span>
        </span>
        { showCategory &&
          <select multiple size={5} value={filters.category}
            onChange={(e) => {
              if (filters.category.includes(e.target.value)) setFilters({...filters, category: filters.category.filter(c => c !== e.target.value)});
              else setFilters({...filters, category: [...filters.category, e.target.value]})
            }}>
            {getEnumKeys(Category).map((key, index) => (
              
              <option style={filters.category.includes(Category[key]) ? { backgroundColor: `#abc` }:undefined} key={index} value={Category[key]}>
                {Category[key]}
              </option>
            ))}
            {getEnumKeys(IncomeCategory).map((key, index) => (
              <option style={filters.category.includes(IncomeCategory[key]) ? { backgroundColor: `#abc` }:undefined} key={index} value={IncomeCategory[key]}>
                {IncomeCategory[key]}
              </option>
            ))}
          </select>
        }
        { !showCategory && (filters.category.length > 0 ? <div id='filter-category-list'>{ filters.category.map((c) => c.toString() + ' ')}</div> : <span>None</span>)}
      </li>

      <li>
        <label>Store/Source: </label>
        <input 
          type='text' 
          value={filters.source} 
          onChange={(e) => setFilters({...filters, source: e.target.value.split(',')})}
        />
      </li>

      <li>
        <label>Low Amount: </label>
        <input type='text' value={filters.lowAmount} onChange={handleLowAmount}/>
      </li>
      <li>
        <label>High Amount: </label>
        <input type='text' value={filters.highAmount} onChange={handleHighAmount}/>
      </li>

      <li>
        <span className='filter-menu-heading'><label className={filters.accounts.length === 0 ? 'filter-menu-togglable':'filter-menu-togglable-nonempty'} onClick={() => { toggleAccounts(); setFilters({...filters, accounts: []}) }}>Accounts: </label>
          <span id='category-img' onClick={toggleAccounts}>{ showAccounts ? <img src='/close-up.svg' /> : <img src='/open-down.svg' /> }</span>
        </span>
        { showAccounts &&
          <select multiple size={5} value={filters.accounts.map(a => String(a))}
            onChange={(e) => {
              if (filters.accounts.includes(Number(e.target.value))) setFilters({...filters, accounts: filters.accounts.filter(a => String(a) !== e.target.value)});
              else setFilters({...filters, accounts: [...filters.accounts, Number(e.target.value)]})
            }}>
            {accountOptions.map((acc, index) => (
              <option style={filters.accounts.includes(acc.id) ? { backgroundColor: `#abc` }:undefined} key={index} value={acc.id}>
                {`${acc.account_type}:${acc.account_name}`}
              </option>
            ))}
          </select>
        }
        { !showCategory && (filters.accounts.length > 0 ? <div id='filter-category-list'>{ accountOptions.filter((a) => filters.accounts.includes(a.id)).map(a => String(`${a.account_type.slice(0,4)}:${a.account_name} `)) }</div> : <span>None</span>)}
      </li>

      <li className='filter-menu-meta'>
        <button id='clear-filters' onClick={resetFilters}>Clear Filters</button>
        <button onClick={toggle}>Hide</button>
      </li>

    </menu>
  )
}