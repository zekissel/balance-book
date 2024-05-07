import { useState } from "react";
import { Transaction, Account } from "../../typedef";
import BoxPlot from "./BoxPlot";
import CategoryBar from "./CategoryBar";
import NetByDay from "./NetByDay";
import Panel from "./Panel";
import PieBurst from "./PieBurst";

interface StatsMainProps {
  logs: Transaction[];
  accounts: Account[];
  startDate: Date;
  endDate: Date;
}
export default function StatsMain({ logs, accounts, startDate, endDate }: StatsMainProps) {

  const [graphType1, setGraph1] = useState(false);
  const toggleGraph1 = () => setGraph1(!graphType1);

  const [graphType2, setGraph2] = useState(false);
  const toggleGraph2 = () => setGraph2(!graphType2);

  const [graphType3, setGraph3] = useState(0);
  const cycle3Next = () => setGraph3((graphType3 + 1) % 3);
  const cycle3Prev = () => setGraph3((graphType3 - 1) < 0 ? 2 : graphType3 - 1);

  return (
    <main className='h-full w-full flex flex-col '>


      <section className='h-[calc(33.33%-1rem)] mt-0.5 mx-0.5 w-[calc(100%-0.25rem)] flex flex-row '>
        <Panel logs={logs} startDate={startDate} endDate={endDate} />

        <div className='w-3/4 h-[calc(100%-0.5rem)] m-0.5 bg-panel flex flex-col justify-between items-center rounded-lg border border-dashed border-bbgray3 '>
            { !graphType1 ? <CategoryBar logs={logs} /> : <div className='w-full h-full'>test</div> }

            <GraphControl justify='end'>
              <button className='z-200 mx-1 rounded-lg hover:bg-highlight ' onClick={toggleGraph1}><img src={ graphType1 ? '/stats/bar.svg' : '/stats/info.svg' } /></button>
            </GraphControl>
        </div>
      </section>


      <section className='h-[calc(33.33%-1rem)] w-[calc(100%-0.25rem)] flex flex-row '>
        <div className='w-3/5 h-[calc(100%-0.5rem)] m-0.5 bg-panel flex flex-col justify-center items-center rounded-lg border border-dashed border-bbgray3 '>
          <NetByDay />
          <GraphControl justify='start'>
            <button className='z-200 mx-1 rounded-lg hover:bg-highlight ' onClick={toggleGraph2}><img src={ graphType2 ? '/stats/line.svg' : '/stats/bar.svg' } /></button>
          </GraphControl>
        </div>

        <div className='w-2/5 h-[calc(100%-0.5rem)] m-0.5 bg-panel flex flex-col justify-center items-center rounded-lg border border-dashed border-bbgray3 '>
          <PieBurst />
          <GraphControl justify='end'>
            <>
              <button className='z-200 mx-1 rounded-lg hover:bg-highlight ' onClick={cycle3Prev}><img src={'/stats/' + (graphType3 === 0 ? 'burst' : (graphType3 === 1 ? 'pie' : 'map')) + '.svg' } /></button>
              <button className='z-200 mx-1 rounded-lg hover:bg-highlight ' onClick={cycle3Next}><img src={'/stats/' + (graphType3 === 0 ? 'map' : (graphType3 === 1 ? 'burst' : 'pie')) + '.svg' } /></button>
            </>
          </GraphControl>
        </div>
      </section>


      <section className='h-[calc(33.33%-1rem)] w-[calc(100%-0.25rem)] flex flex-row '>
        <BoxPlot />

        <BoxPlot />
      </section>
    
    
    </main>
  )
}

interface GraphControlProps {
  children: JSX.Element;
  justify: 'start' | 'end';
}
function GraphControl ({ children, justify }: GraphControlProps) {

  return (
    <menu className={`w-full h-5 flex flex-row justify-${justify} items-center`}>
      <div className='bg-light1 px-1 rounded-lg border-b-2 border-b-solid border-b-bbgray2 flex flex-row items-center'>
        { children }
      </div>
    </menu>
  )
}