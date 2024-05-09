import { useEffect, useMemo, useState } from "react";
import { Transaction, Account, getTransactions, getAccounts, Category, formatAccount, formatAmount, formatDate, formatCategory } from "../../typedef";
import { Filter, anyFiltersActive } from "../filter";
import ViewLog from "./ViewLog";
import ViewMultiLog from "./MultiLog";
import loading from '../../assets/loading.svg';

interface ListProps { 
  filters: Filter;
  signal: boolean;
  update: () => void;
}
export default function List({ filters, signal, update }: ListProps) {

  enum DataState { Loading, Success }
  const [dataState, setDataState] = useState<DataState>(DataState.Loading);

  const [curPage, setCurPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const updatePerPage = (perPage: number) => setPerPage(perPage);

  interface Sorter { 
    field: 'date' | 'store' | 'category' | 'amount' | 'type' | 'account';
    order: -1 | 1;
  }
  const [sortBy, setSortBy] = useState<Sorter>({ field: 'date', order: -1 });
  const getSVG = (field: string, order: -1 | 1) => {
    let ret = '';
    if (field === 'Date') ret = '/misc/sort-down.svg';
    if (field === 'Store') ret = '/misc/sort-a-z.svg';
    if (field === 'Category') ret = '/misc/sort-a-z.svg';
    if (field === 'Amount') ret = '/misc/sort-down.svg';
    if (field === 'Type') return '/misc/sort.svg';
    if (field === 'Account') ret = '/misc/sort-a-z.svg';

    if (sortBy.field === field.toLowerCase() && order > 0) {
      ret = ret.replace('down', 'up').replace('a-z', 'z-a');
    }
    return ret;
  }

  const [totalLogs, setTotalLogs] = useState(0);

  const [logs, setLogs] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);


  const [selectLogs, setSelectLogs] = useState<string[]>([]);
  const updateSelected = (transId: string) => {
    if (selectLogs.includes(transId)) setSelectLogs(selectLogs.filter(t => t !== transId));
    else setSelectLogs([...selectLogs, transId]);
  }
  const selected: Transaction[] = useMemo(() => {
    return logs.filter(t => selectLogs.includes(t.id));
  }, [selectLogs, logs]);
  const selectedType = useMemo(() => {
    const leafs = selected.map(t => t.category.split('>')[1]);
    if (leafs.includes('Credit') || leafs.includes('Transfer')) return 0;
    const inFlow = selected.filter(t => t.amount > 0);
    if (inFlow.length === selected.length) return 1;
    const outFlow = selected.filter(t => t.amount < 0);
    if (outFlow.length === selected.length) return -1;
    return 0;
  }, [selected]);

  

  useEffect(() => {
    setDataState(DataState.Loading);
    const fetchLogs = async () => {
      setSelectLogs([]);
      const [trans, count] = await getTransactions(filters, { current_page: curPage, page_size: perPage, sort_field: sortBy.field, sort_asc: sortBy.order === 1});
      setLogs(trans);
      setTotalLogs(count);
    }
    fetchLogs();
    setDataState(DataState.Success);
  }, [signal]);

  useEffect(() => {
    const fetchAccounts = async () => { setAccounts(await getAccounts()) }
    fetchAccounts();
  }, []);


  const getColor = (amount: number, category: Category) => {
    if (['Transfer', 'Credit'].includes(category.split('>')[1])) return 'bg-neutral2 ';
    if (amount < 0) return 'bg-negative2 ';
    else return 'bg-primary3 ';
  }


  return (
    <>
      <div className='flex flex-col h-12 pb-1 md:flex-row-reverse '>
        <menu className='w-full h-12 flex flex-row justify-around bg-light1 md:w-2/3 '>

          { ['Date', 'Store', 'Category', 'Amount', 'Type', 'Account'].map(field => (
            <button
              key={field}
              className={'flex flex-row h-fit mx-0 mt-2 p-1 rounded ' + (sortBy.field === field.toLowerCase() ? 'bg-primary2 ' : 'bg-bbgray1 hover:bg-bbgray3 ')}
              onClick={() => {setSortBy({ field: field.toLowerCase() as Sorter['field'], order: sortBy.field === field.toLowerCase() ? (-1 * sortBy.order) as (-1 | 1) : -1 }); update()}}
            ><img src={getSVG(field, sortBy.order)} />{ field }</button>
          )) }
        </menu>

        <Control maxPage={Math.ceil(totalLogs / perPage)} curPage={curPage} setCurPage={setCurPage} perPage={perPage} setPerPage={updatePerPage} update={update} />
      </div>

      <ol className='w-[calc(100%-0.5rem)] h-[calc(100%-8rem)] md:h-[calc(100%-6rem)] m-1 mx-auto flex flex-col bg-light2 mt-8 md:mt-0 overflow-y-auto'>
        { 
          logs.map((log) => (
            <li key={log.id} className='w-[calc(100%-1rem)] p-1 ml-1 mr-auto my-1 bg-panel rounded flex flex-row items-center justify-around hover:opacity-80 ' onClick={() => updateSelected(log.id)}>

              <input className='mr-2' type='checkbox' checked={selectLogs.includes(log.id)} onChange={(e) => {updateSelected(log.id); e.stopPropagation()}} />

              <div className={'w-full grid grid-cols-4 gap-2 md:grid-cols-[.8fr_1.2fr_.8fr_1.6fr_1fr_1fr] border-dashed border rounded ' + (selectLogs.includes(log.id) ? 'border-neutral1 bg-neutral3' : 'border-panel ')} >
                <span className='text-xs font-mono font-semibold overflow-hidden '>{ formatDate(log.date) }</span>
                <span className='font-serif overflow-hidden w-full '>{ log.store }</span>
                
                <span className='justify-self-end bg-white rounded-lg px-1 font-semibold font-mono h-fit '>{ formatAmount(log.amount, ['Transfer', 'Credit'].includes(log.category.split('>')[1])) }</span>
                <span className={'font-medium w-fit px-1 rounded-lg h-fit ' + getColor(log.amount, log.category)}>{ formatCategory(log.category) }</span>
                

                <span className='hidden justify-self-end md:grid overflow-hidden w-[calc(120%)] '>{ log.desc }</span>
                <span className='hidden justify-self-end text-right text-xs font-mono font-semibold pr-1 md:grid '>{ formatAccount(log.account_id, accounts) }</span>
              </div>
            </li>
          ))
        }

        { dataState === DataState.Success && logs.length === 0 &&
          <li className='w-full bg-bbgray1 mt-2 py-2 text-center '>
            <span>No transactions found { anyFiltersActive(filters) && `(filters active)` }</span>
          </li>
        }

        { dataState === DataState.Loading &&
          <li className='absolute top-[calc(7.5rem)] left-32 w-[calc(85%)] h-[calc(80%)] flex flex-col items-center justify-center rounded-3xl '>
            <img className='h-24 animate-spin-slow ' src={loading} alt='loading' />
          </li>
        }

      </ol>

      { selectLogs.length === 1 &&
        <ViewLog transaction={selected[0]} account={accounts.find(a => a.id === selected[0].account_id)!} update={update} close={() => setSelectLogs([])} />
      }

      { selectLogs.length > 1 &&
        <ViewMultiLog transactions={selected} accounts={accounts} type={selectedType} update={update} close={() => setSelectLogs([])} />
      }
    </>
  )
}



interface ControlProps {
  maxPage: number;
  curPage: number;
  setCurPage: (perPage: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  update: () => void;
}
function Control ({ maxPage, curPage, setCurPage, perPage, setPerPage, update }: ControlProps) {

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const am = e.target.value;
		if (!am || am.match(/^\d{1,}$/)) {
			if (Number(am) <= maxPage && Number(am) >= 1) setCurPage(Number(am));
      update();
    }
  }

  return (
    <menu className='w-full h-12 flex flex-row justify-between bg-light1 md:w-1/3 '>
      <div className='flex flex-row items-center m-2'>
        <button className={'bg-bbgray1 rounded-lg ' + (curPage > 1 ? 'hover:bg-bbgray3 ' : '')} disabled={curPage <= 1} onClick={() => {setCurPage(curPage - 1); update()}}>
          <img src='/misc/previous.svg' draggable={false} />
        </button>

        <input className='w-8 text-center rounded ' type='text' value={curPage} onChange={handleNumber} />
        <span>{ ` / ${maxPage}` }</span>

        <button className={'bg-bbgray1 rounded-lg ' + (curPage < maxPage ? 'hover:bg-bbgray3 ' : '')} disabled={curPage >= maxPage} onClick={() => {setCurPage(curPage + 1); update()}}>
          <img src='/misc/next.svg' draggable={false} />
        </button>
      </div>

      <div className='flex flex-row items-center m-2'>
        <label className='text-sm ' htmlFor='perpage'>Per page: </label>
        <select id='perpage' value={perPage} onChange={(e) => {setPerPage(Number(e.target.value)); setCurPage(1); update()}}>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>
      </div>
    </menu>
  )
}