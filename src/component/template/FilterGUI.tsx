import React, { useState } from 'react';
import { Filter, ExpenseCat, IncomeCat, getEnumKeys, Account } from '../../typedef';
import { addDays } from '../../typeassist';
import '../../styles/Filter.css';


interface FilterProps { accounts: Account[], toggle: () => void, filters: Filter, setFilters: React.Dispatch<React.SetStateAction<Filter>> }
export default function FilterGUI ({ accounts, toggle, filters, setFilters }: FilterProps) {


  const [showStartDate, setShowStartDate] = useState(filters.startDate !== null);
  const toggleStartDate = () => setShowStartDate(!showStartDate);
  const [showEndDate, setShowEndDate] = useState(filters.endDate !== null);
  const toggleEndDate = () => setShowEndDate(!showEndDate);
  const [showCategory, setShowCategory] = useState(false);
  const toggleCategory = () => setShowCategory(!showCategory);

  const [showAccounts, setShowAccounts] = useState(false);
  const toggleAccounts = () => setShowAccounts(!showAccounts);

  const handleLowAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
    if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setFilters({ ...filters, lowAmount: am});
      sessionStorage.setItem('filter.low', am);
    }
  }
  const handleHighAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
    if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setFilters({ ...filters, highAmount: am});
      sessionStorage.setItem('filter.high', am);
    }
  }

  const handleType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({...filters, type: e.target.value as string});
    sessionStorage.setItem('filter.type', e.target.value);
  }

  const voidStartDate = () => { toggleStartDate(); setFilters({...filters, startDate: null}); sessionStorage.removeItem('filter.start'); }
  const handleStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = addDays(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')), 0);
    setFilters({...filters, startDate: date });
    sessionStorage.setItem('filter.start', date.toDateString());
  }
  
  const voidEndDate = () => { toggleEndDate(); setFilters({...filters, endDate: null}); sessionStorage.removeItem('filter.end'); }
  const handleEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = addDays(new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')), 0);
    setFilters({...filters, endDate: date });
    sessionStorage.setItem('filter.end', date.toDateString());
  }

  const voidCategory = () => { toggleCategory(); setFilters({...filters, category: []}); sessionStorage.removeItem('filter.category'); }
  const handleCategory = (e: any) => {
    if (filters.category.includes(e.target.value)) {
      const newCategories = filters.category.filter(c => c !== e.target.value);
      setFilters({ ...filters, category: newCategories });
      sessionStorage.setItem('filter.category', newCategories.join(' '));
    } else {
      const newCategories = [...filters.category, e.target.value];
      setFilters({ ...filters, category: newCategories });
      sessionStorage.setItem('filter.category', newCategories.join(' '));
    }
  }

  const handleSource = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sources = e.target.value.split(',');
    setFilters({ ...filters, source: sources })
    sessionStorage.setItem('filter.source', sources.join(' '));
  }

  const voidAccounts = () => { toggleAccounts(); setFilters({...filters, accounts: []}); sessionStorage.removeItem('filter.accounts'); }
  const handleAccounts = (e: any) => {
    if (filters.accounts.includes(Number(e.target.value))) {
      const newAccounts = filters.accounts.filter(a => a !== Number(e.target.value));
      setFilters({ ...filters, accounts: newAccounts });
      sessionStorage.setItem('filter.accounts', newAccounts.join(' '));
    } else {
      const newAccounts = [...filters.accounts, Number(e.target.value)];
      setFilters({ ...filters, accounts: newAccounts });
      sessionStorage.setItem('filter.accounts', newAccounts.join(' '));
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
    sessionStorage.removeItem('filter.type');
    sessionStorage.removeItem('filter.start');
    sessionStorage.removeItem('filter.end');
    sessionStorage.removeItem('filter.category');
    sessionStorage.removeItem('filter.source');
    sessionStorage.removeItem('filter.low');
    sessionStorage.removeItem('filter.high');
    sessionStorage.removeItem('filter.accounts');
  };


  return (
    <menu className='filter-menu'>

      <li>
        <label>Type: </label>
        <select value={filters.type} onChange={handleType} >
          <option value={`all`}>All</option>
          <option value={`expense`}>Expense</option>
          <option value={`income`}>Income</option>
        </select>
      </li>

      <li>
        <label className='filter-menu-togglable' onClick={voidStartDate}>Start Date: </label>
        { showStartDate && <input type='date' value={filters.startDate ? (addDays(filters.startDate!, 0).toISOString().substring(0, 10)) : undefined } onChange={handleStartDate}/> }
        { !showStartDate && <span>None</span>}
      </li>
      <li>
        <label className='filter-menu-togglable' onClick={voidEndDate}>End Date: </label>
        { showEndDate && <input type='date' value={filters.endDate ? filters.endDate.toISOString().substring(0, 10) : undefined} onChange={handleEndDate} /> }
        { !showEndDate && <span>None</span>}
      </li>

      <li>
        <span className='filter-menu-heading'>
          <label className={filters.category.length === 0 ? 'filter-menu-togglable':'filter-menu-togglable-nonempty'} onClick={voidCategory}>Categories: </label>
          <span id='category-img' onClick={toggleCategory}>{ showCategory ? <img src='/close-up.svg' /> : <img src='/open-down.svg' /> }</span>
        </span>
        { showCategory &&
          <select multiple size={5} value={filters.category} onChange={handleCategory}>
            {getEnumKeys(ExpenseCat).map((key, index) => (
              
              <option style={filters.category.includes(ExpenseCat[key]) ? { backgroundColor: `#abc` }:undefined} key={index} value={ExpenseCat[key]} onClick={handleCategory}>
                {ExpenseCat[key]}
              </option>
            ))}
            {getEnumKeys(IncomeCat).map((key, index) => (
              <option style={filters.category.includes(IncomeCat[key]) ? { backgroundColor: `#abc` }:undefined} key={index} value={IncomeCat[key]} onClick={handleCategory}>
                {IncomeCat[key]}
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
          onChange={handleSource}
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
        <span className='filter-menu-heading'><label className={filters.accounts.length === 0 ? 'filter-menu-togglable':'filter-menu-togglable-nonempty'} onClick={voidAccounts}>Accounts: </label>
          <span id='category-img' onClick={toggleAccounts}>{ showAccounts ? <img src='/close-up.svg' /> : <img src='/open-down.svg' /> }</span>
        </span>
        { showAccounts &&
          <select multiple size={5} value={filters.accounts.map(a => String(a))}
            onChange={handleAccounts}>
            {accounts.map((acc, index) => (
              <option style={filters.accounts.includes(acc.id) ? { backgroundColor: `#abc` } : undefined} key={index} value={acc.id} onClick={handleAccounts}>
                {`${acc.account_type}:${acc.account_name}`}
              </option>
            ))}
          </select>
        }
        { !showAccounts && (filters.accounts.length > 0 ? <div id='filter-category-list'>{ accounts.filter((a) => filters.accounts.includes(a.id)).map(a => String(`${a.account_type.slice(0,4)}:${a.account_name} `)) }</div> : <span>None</span>)}
      </li>

      <li className='filter-menu-meta'>
        <button id='clear-filters' onClick={resetFilters}>Clear Filters</button>
        <button onClick={toggle}>Hide</button>
      </li>

    </menu>
  )
}