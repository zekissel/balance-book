import { useMemo } from "react";
import { Transaction } from "../../typedef";

interface PanelProps {
  logs: Transaction[];
  startDate: Date;
  endDate: Date;
}
export default function Panel ({ logs, startDate, endDate }: PanelProps) {

  const netBalance = useMemo(() => {
    return logs./*filter(l => !['Transfer', 'Credit'].includes(l.category.split('>')[1])).*/reduce((acc, log) => acc + log.amount, 0);
  }, [logs]);

  const [deposits, depositTotal] = useMemo(() => {
    const dep = logs.filter(l => !['Transfer', 'Credit'].includes(l.category.split('>')[1])).filter(l => l.amount > 0);
    return [dep, dep.reduce((acc, log) => acc + log.amount, 0)];
  }, [logs]);

  const [withdrawals, withdrawalTotal] = useMemo(() => {
    const withd = logs.filter(l => !['Transfer', 'Credit'].includes(l.category.split('>')[1])).filter(l => l.amount < 0);
    return [withd, withd.reduce((acc, log) => acc + log.amount, 0)];
  }, [logs]);

  const [transfers, transferTotal] = useMemo(() => {
    const trans = logs.filter(l => ['Transfer', 'Credit'].includes(l.category.split('>')[1])).filter(l => l.amount > 0);
    return [trans, trans.reduce((acc, log) => acc + log.amount, 0)];
  }, [logs]);

  return (
    <div className='w-1/4 h-[calc(100%-0.5rem)] m-0.5 bg-panel flex flex-col justify-center items-center rounded-lg border border-dashed border-bbgray3 '>

      <h2 className='font-semibold text-lg '>Net Balance</h2>

      <span className={'bg-light2 font-mono px-2 py-1 mb-1 rounded-xl text-lg font-semibold ' + (netBalance !== 0 ? (netBalance > 0 ? `text-good1 ` : `text-warn1 `) : `text-neutral4 `)}>{ netBalance < 0 ? `-$` : `+$` }{ Math.abs(netBalance / 100) }</span>

      <span className='flex flex-col mb-1 '>
        <span><em>Since { startDate.toDateString().slice(0, 10) },</em></span>
        <span><em>Until { endDate.toDateString().slice(0, 10) }</em></span>
      </span>

      <span className='grid grid-cols-[1fr_1.6fr] mb-1 bg-light1 p-1 rounded-lg items-center text-sm '>
        <span className='justify-self-end mr-1 '>Deposit:</span><span className='justify-self-end'> +${ (depositTotal / 100).toFixed(2) } ({ deposits.length })</span>
        <span className='justify-self-end mr-1 '>Withdraw:</span><span className='justify-self-end'> -${ Math.abs(withdrawalTotal / 100).toFixed(2) } ({ withdrawals.length })</span>
        <span className='justify-self-end mr-1 '>Internal:</span><span className='justify-self-end'> ${ Math.abs(transferTotal / 100).toFixed(2) } ({ transfers.length })</span>
      </span>
    </div>
  )
}