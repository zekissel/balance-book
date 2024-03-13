import React, { useState } from 'react';
import { Filters, Category, IncomeCategory, getEnumKeys } from '../../typedef';
import '../../styles/Filter.css';


interface FilterProps { toggle: () => void, filters: Filters, setFilters: React.Dispatch<React.SetStateAction<Filters>> }
export default function Filter ({ toggle, filters, setFilters }: FilterProps) {


  const [showStartDate, setShowStartDate] = useState(filters.startDate !== null);
  const toggleStartDate = () => setShowStartDate(!showStartDate);
  const [showEndDate, setShowEndDate] = useState(filters.endDate !== null);
  const toggleEndDate = () => setShowEndDate(!showEndDate);
  const [showCategory, setShowCategory] = useState(false);
  const toggleCategory = () => setShowCategory(!showCategory);

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
    });
    setShowStartDate(false);
    setShowEndDate(false);
    setShowCategory(false);
  };

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
        { showStartDate && <input type='date' value={filters.startDate?.toISOString().substring(0, 10)} onChange={(e) => setFilters({...filters, startDate: new Date(e.target.value)})}/> }
        { !showStartDate && <span>None</span>}
      </li>
      <li>
        <label className='filter-menu-togglable' onClick={() => { toggleEndDate(); setFilters({...filters, endDate: null}); }}>End Date: </label>
        { showEndDate && <input type='date' value={filters.endDate?.toISOString().substring(0, 10)} onChange={(e) => setFilters({...filters, endDate: new Date(e.target.value)})} /> }
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

      <li className='filter-menu-meta'>
        <button id='clear-filters' onClick={resetFilters}>Clear Filters</button>
        <button onClick={toggle}>Hide</button>
      </li>

    </menu>
  )
}