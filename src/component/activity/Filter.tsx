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
        <label onClick={() => { toggleStartDate(); setFilters({...filters, startDate: null}); }}>Start Date: </label>
        { showStartDate && <input type='date' defaultValue={filters.startDate?.toDateString()} onChange={(e) => setFilters({...filters, startDate: new Date(e.target.value)})}/> }
      </li>
      <li>
        <label onClick={() => { toggleEndDate(); setFilters({...filters, endDate: null}); }}>End Date: </label>
        { showEndDate && <input type='date' onChange={(e) => setFilters({...filters, endDate: new Date(e.target.value)})} defaultValue={filters.endDate?.toDateString()}/> }
      </li>

      <li>
        <label onClick={() => { toggleCategory(); setFilters({...filters, category: []}) }}>Category: </label>
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
      </li>

      <li>
        <label>Store/Source: </label>
        <input type='text' value={filters.source} onChange={(e) => setFilters({...filters, source: e.target.value.split(',')})}/>
      </li>

      <li>
        <label>Low Amount</label>
        <input type='text' value={filters.lowAmount} onChange={handleLowAmount}/>
      </li>
      <li>
        <label>High Amount</label>
        <input type='text' value={filters.highAmount} onChange={handleHighAmount}/>
      </li>

      <li>
        <button onClick={() => setFilters({ 
          type: `all`, 
          startDate: null,
          endDate: null,
          category: [],
          source: [''],
          lowAmount: '0',
          highAmount: '0', 
        })}>Clear Filters</button>
        <button onClick={toggle}>X</button>
      </li>

    </menu>
  )
}