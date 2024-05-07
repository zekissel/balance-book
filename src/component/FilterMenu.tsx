import { useState, useMemo, useEffect } from "react";
import TreeSelect from "./TreeSelect";
import { ExpenseLeaf, IncomeLeaf, Account, getAccounts, addDays } from "../typedef";
import { Filter } from "./filter";

interface FilterBarProps {
  filters: Filter;
  setFilters: React.Dispatch<React.SetStateAction<Filter>>;
  signal: boolean;
  refresh: () => void;
}
export default function FilterBar({ filters, setFilters, signal, refresh }: FilterBarProps) {

  const [accounts, setAccounts] = useState<Account[]>([]);
  useEffect(() => {
    const fetchLogs = async () => { setAccounts(await getAccounts()); }
    fetchLogs();
  }, [signal]);

  const handleCategory = (e: string[]) => {
		setFilters({ ...filters, category: e });
		//sessionStorage.setItem('filter.category', e.join(' '));
	};

  const [amountLow, setAmountLow] = useState(String(filters.low_amount / 100));
  const displayAmountLow = useMemo(() => {
		return `${Math.abs(Number(amountLow))}${amountLow.charAt(amountLow.length - 1) === '.' ? '.' : ''}${(amountLow.charAt(amountLow.length - 2) === '.' && amountLow.charAt(amountLow.length - 1) === '0') ? '.0' : ''}${(amountLow.charAt(amountLow.length - 3) === '.' && amountLow.charAt(amountLow.length - 1) === '0') ? (amountLow.charAt(amountLow.length - 2) === '0' ? `.00` : '0') : ''}`
  }, [amountLow]);

  const [amountHigh, setAmountHigh] = useState(String(filters.low_amount / 100));
  const displayAmountHigh = useMemo(() => {
		return `${Math.abs(Number(amountHigh))}${amountHigh.charAt(amountHigh.length - 1) === '.' ? '.' : ''}${(amountHigh.charAt(amountHigh.length - 2) === '.' && amountHigh.charAt(amountHigh.length - 1) === '0') ? '.0' : ''}${(amountHigh.charAt(amountHigh.length - 3) === '.' && amountHigh.charAt(amountHigh.length - 1) === '0') ? (amountHigh.charAt(amountHigh.length - 2) === '0' ? `.00` : '0') : ''}`
  }, [amountHigh]);

  const handleLow = (e: React.ChangeEvent<HTMLInputElement>) => {
		const am = e.target.value;
		if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmountLow(am);
      setFilters({ ...filters, low_amount: Number(am) * 100 });
		}
	};
  const handleHigh = (e: React.ChangeEvent<HTMLInputElement>) => {
		const am = e.target.value;
		if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
      setAmountHigh(am);
      setFilters({ ...filters, high_amount: Number(am) * 100 });
		}
	};

  const [store, setStore] = useState(filters.store);
  const storeDisplay = useMemo(() => {
    if (filters.store.length === 0) return '';
		return `${filters.store.includes('X') ? '(Exclude), ' : ''}${filters.store.filter(s => s !== 'X').join(', ')}`
  }, [store, filters.store]);
  
  const handleStore = (e: React.ChangeEvent<HTMLInputElement>) => {
		const stores = e.target.value.split(', ').map(s => s.replace('(Exclude)', 'X'));
		setFilters({ ...filters, store: stores.map(s => s.trim()) });
    setStore(stores);
		//sessionStorage.setItem('filter.source', stores.join(' '));
	};

  const handleAccounts = (e: string[]) => {
		setFilters({ ...filters, account: e });
		//sessionStorage.setItem('filter.accounts', e.join(' '));
	};

  const excludeStore = () => {
    let s = [];
    if (filters.store.includes('X')) {
      s = filters.store.filter((c) => c !== 'X');
      setFilters({ ...filters, store: s });
      //sessionStorage.setItem('filter.source', no_ex.join(' '));
    } else {
      s = [...filters.store, 'X'];
      setFilters({ ...filters, store: s });
      //sessionStorage.setItem('filter.source', ex.join(' '));
    }
    setStore(s);
  };

	const excludeAccounts = () => {
		if (filters.account.includes('X')) {
			const no_ex = filters.account.filter((c) => c !== 'X');
			setFilters({ ...filters, account: no_ex });
			//sessionStorage.setItem('filter.accounts', no_ex.join(' '));
		} else {
			const ex = [...filters.account, 'X'];
			setFilters({ ...filters, account: ex });
			//sessionStorage.setItem('filter.accounts', ex.join(' '));
		}
	};

  const excludeCategory = () => {
		if (filters.category.includes('X')) {
			const no_ex = filters.category.filter((c) => c !== 'X');
			setFilters({ ...filters, category: no_ex });
			//sessionStorage.setItem('filter.category', no_ex.join(' '));
		} else {
			const ex = [...filters.category, 'X'];
			setFilters({ ...filters, category: ex });
			//sessionStorage.setItem('filter.category', ex.join(' '));
		}
	};

  const resetFilters = () => {
		setFilters({
			type_: null,
			start_date: null,
			end_date: null,
			category: [],
			store: [],
			low_amount: 0,
			high_amount: 0,
			account: [],
		});
    setAmountHigh('0');
    setAmountLow('0');
    refresh();
	};

  return (
    <menu className='h-14 w-full flex flex-row justify-evenly items-end pb-2 bg-light1 border-b-bbgray2 border-b-dashed border-b-2 overflow-hidden overflow-x-scroll '>

      <li className='w-1/7 flex flex-col items-center'>
        <span className='flex flex-row justify-center'>
          <label className='text-sm ' htmlFor='filter.startdate'>Start</label>
          <img className='rounded-xl hover:bg-light2' src='/misc/x.svg' onClick={() => setFilters({ ...filters, start_date: null })} />
        </span>
        <input className='h-6 rounded border border-dashed border-primary ' type='date' id='filter.startdate' value={filters.start_date !== null ? addDays(filters.start_date, 1).toISOString().slice(0, 10) : ''} onChange={(e) => setFilters({ ...filters, start_date: addDays(new Date(e.target.value), 0)})} />
      </li>

      <li className='w-1/7 flex flex-col items-center'>
        <span className='flex flex-row justify-center'>
          <label className='text-sm ' htmlFor='filter.enddate'>End</label>
          <img className='rounded-xl hover:bg-light2' src='/misc/x.svg' onClick={() => setFilters({ ...filters, end_date: null })} />
        </span>
        <input className='h-6 w-24 rounded border border-dashed border-primary ' type='date' id='filter.enddate' value={filters.end_date !== null ? addDays(filters.end_date, 0).toISOString().slice(0, 10) : ''} onChange={(e) => setFilters({ ...filters, end_date: addDays(new Date(e.target.value), 1)})} />
      </li>

      <li className='w-min flex flex-col items-center'>
        <span className='flex flex-row'>
          <label className='text-sm ' htmlFor='filter.store'>Store</label>
          <img className='rounded-xl hover:bg-light2' src={`misc/${filters.store.includes('X') ? 'exclude' : 'include'}.svg`} onClick={excludeStore} />
          <img className='rounded-xl hover:bg-light2' src='/misc/x.svg' onClick={() => {setFilters({ ...filters, store: [] }); setStore([])}} />
        </span>
        <input className='w-[calc(8rem)] rounded border border-dashed border-primary' type='text' id='filter.store' value={storeDisplay} onChange={handleStore} placeholder='Store, ...' />
      </li>

      <li className='w-1/7 flex flex-col items-center'>
        <span className='flex flex-row'>
          <label className='text-sm ' htmlFor='filter.category'>Category</label>
          <img className='rounded-xl hover:bg-light2' src={`misc/${filters.category.includes('X') ? 'exclude' : 'include'}.svg`} onClick={excludeCategory} />
          <img className='rounded-xl hover:bg-light2' src='/misc/x.svg' onClick={() => setFilters({ ...filters, category: [] })} />
        </span>
        <TreeSelect
					value={filters.category}
					options={ExpenseLeaf}
					onChange={handleCategory}
					multi={true}
					option2={IncomeLeaf}
				/>
      </li>

      <li className='w-1/7 flex flex-col items-center'>
        <span className='flex flex-row'>
          <label className='text-sm ' htmlFor='filter.account'>Account</label>
          <img className='rounded-xl hover:bg-light2' src={`misc/${filters.account.includes('X') ? 'exclude' : 'include'}.svg`} onClick={excludeAccounts} />
          <img className='rounded-xl hover:bg-light2' src='/misc/x.svg' onClick={() => setFilters({ ...filters, account: [] })} />
        </span>
        <TreeSelect
					value={filters.account}
					options={accounts}
					onChange={handleAccounts}
					multi={true}
				/>
      </li>

      <li className='w-1/7 flex flex-col items-center'>
        <label className='text-sm ' htmlFor='filter.type'>Type</label>
        <select className='h-6 rounded border border-dashed border-primary ' id='filter.type' onChange={(e) => {setFilters({ ...filters, type_: e.target.value === 'null' ? null : Number(e.target.value) })}}>
          <option value={'null'}>All</option>
          <option value={1}>Income</option>
          <option value={-1}>Expense</option>
          <option value={0}>Internal</option>
        </select>
      </li>

      <li className='w-1/7 flex flex-col items-center'>
        <label className='text-sm ' htmlFor='filter.low'>Low $</label>
        <input className='w-16 text-right rounded border border-dashed border-primary ' type='text' id='filter.low' value={displayAmountLow} onChange={handleLow} />
      </li>

      <li className='w-1/7 flex flex-col items-center'>
        <label className='text-sm ' htmlFor='filter.high'>High $</label>
        <input className='w-16 text-right rounded border border-dashed border-primary ' type='text' id='filter.high' value={displayAmountHigh} onChange={handleHigh} />
      </li>
      

      <li className='w-1/7 my-auto flex flex-col items-center justify-center '>
        <button className='bg-primary2 p-0 pb-0.5 px-2 mt-0.5 rounded-lg border border-solid font-medium border-white hover:bg-primary ' onClick={refresh}>Apply</button>
        <button className='bg-bbgray1 p-0.2 rounded-lg hover:bg-bbgray3' onClick={resetFilters}>Clear</button>
      </li>

    </menu>
  )
}