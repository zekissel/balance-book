import React, { useMemo, useState } from "react";
import { Transaction, Account } from "../../typedef";
import BoxPlot from "./BoxPlot";
import CategoryBar from "./CategoryBar";
import NetByDay from "./NetByDay";
import Panel from "./Panel";
import CategoryPie from "./CategoryPie";
import SunMap from "./SunMap";
import TreeAlt from "./Tree";
import Sankey from "./Sankey";
import StatsList from "./StatsList";

interface StatsMainProps {
  logs: Transaction[];
  accounts: Account[];
  startDate: Date;
  endDate: Date;
}
export default function StatsMain({ logs, accounts, startDate, endDate }: StatsMainProps) {

  const range = useMemo(() => {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  }, [startDate, endDate]);

  const [graphType1, setGraph1] = useState(false);
  const toggleGraph1 = () => setGraph1(!graphType1);

  const [graphType2, setGraph2] = useState(false);
  const toggleGraph2 = () => setGraph2(!graphType2);

  const [graphType3, setGraph3] = useState(0);
  const cycle3Next = () => setGraph3((graphType3 + 1) % 3);
  const cycle3Prev = () => setGraph3((graphType3 - 1) < 0 ? 2 : graphType3 - 1);
  const [graph3Income, setGraph3Income] = useState(true);

  const [graph4Income, setGraph4Income] = useState(true);
  const [graph4Root, setGraph4Root] = useState<string | null>(null);
  const handleRoot = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '') setGraph4Root(null);
    else setGraph4Root(e.target.value);
  }

  const [graphType5, setGraph5] = useState(false);
  const toggleGraph5 = () => setGraph5(!graphType5);

  const [full, setFull] = useState({
    info: false,
    netDay: false,
    pie: false,
    box: false,
    sankey: false,
  })

  return (
    <main className='h-full w-full flex flex-col '>


      <section className='h-[calc(33.33%-1rem)] mt-0.5 mx-0.5 w-[calc(100%-0.25rem)] flex flex-row '>
        { !(full.box || full.pie || full.netDay || full.sankey || full.info) ? <Panel logs={logs} startDate={startDate} endDate={endDate} /> : <></> }

        <div className={'w-3/4 h-[calc(100%-0.5rem)] m-0.5 flex flex-col justify-between items-center rounded-lg border border-dashed ' + (!full.info ? ((full.box || full.pie || full.netDay || full.sankey) ? 'hidden bg-light1 ' : 'relative -z-3 bg-panel border-bbgray3 ') : 'bg-light2 border-light2 ')}>
            { !graphType1 ? 
              <CategoryBar logs={logs} full={full.info} toggleFull={() => setFull({ ...full, info: !full.info })} /> 
            : 
              <StatsList transactions={logs} full={full.info} toggleFull={() => setFull({ ...full, info: !full.info })} />
            }

            <GraphControl full={full.info}>
              <GraphButton onClick={toggleGraph1}>
                { !full.info ? <img src={ graphType1 ? '/stats/bar.svg' : '/stats/info.svg' } /> : <></>}
              </GraphButton>
            </GraphControl>
        </div>
      </section>


      <section className='h-[calc(33.33%-1rem)] w-[calc(100%-0.25rem)] flex flex-row '>
        <div className={'w-3/5 h-[calc(100%-0.5rem)] m-0.5 flex flex-col justify-between items-center rounded-lg border border-dashed ' + (!full.netDay ? ((full.box || full.pie || full.info || full.sankey) ? 'hidden bg-light1 ' : 'relative -z-3 bg-panel border-bbgray3 ') : 'bg-light2 border-light2 ')}>
          <NetByDay logs={logs} range={range} endDate={endDate} typeLine={!graphType2} full={full.netDay} toggleFull={() => setFull({ ...full, netDay: !full.netDay })} />
          <GraphControl full={full.netDay}>
            <GraphButton onClick={toggleGraph2}>
              { !full.netDay ? <img src={ graphType2 ? '/stats/line.svg' : '/stats/bar.svg' } /> : <></> }
            </GraphButton>
          </GraphControl>
        </div>

        <div className={'w-2/5 h-[calc(100%-0.5rem)] m-0.5 flex flex-col justify-between items-center rounded-lg border border-dashed ' + (!full.pie ? ((full.box || full.info || full.netDay || full.sankey) ? 'hidden bg-light1 ' : 'relative -z-3 bg-panel border-bbgray3 ') : 'bg-light2 border-light2 ')}>
          { graphType3 === 0 ? 
            <CategoryPie logs={logs} typeIncome={graph3Income} full={full.pie} toggleFull={() => setFull({ ...full, pie: !full.pie })}/> 
          : 
            <SunMap trans={logs} treemap={graphType3 === 1} income={graph3Income} full={full.pie} toggleFull={() => setFull({ ...full, pie: !full.pie })} />
          }
          <GraphControl
            full={full.pie} 
            toggle={ !full.pie ?
              <>
                <button className={'text-sm z-200 mx-0.5 rounded-lg hover:bg-highlight px-0.5 ' + (graph3Income ? 'bg-primary3 ' : '')} onClick={() => setGraph3Income(true)}>Income</button>
                <button className={'text-sm z-200 mx-0.5 rounded-lg hover:bg-highlight px-0.5 ' + (!graph3Income ? 'bg-primary3 ' : '')} onClick={() => setGraph3Income(false)}>Expense</button>
              </>
              :
              <></>
            }
          >
            { !full.pie ? 
              <>
                <GraphButton onClick={cycle3Prev}>
                  <img src={'/stats/' + (graphType3 === 0 ? 'burst' : (graphType3 === 1 ? 'pie' : 'map')) + '.svg' } />
                </GraphButton>
                <GraphButton onClick={cycle3Next}>
                  <img src={'/stats/' + (graphType3 === 0 ? 'map' : (graphType3 === 1 ? 'burst' : 'pie')) + '.svg' } />
                </GraphButton>
              </>
              :
              <></> 
            }
          </GraphControl>
        </div>
      </section>


      <section className='h-[calc(33.33%-1rem)] w-[calc(100%-0.25rem)] flex flex-row '>
        <div className={'w-2/5 h-[calc(100%-0.5rem)] m-0.5 flex flex-col justify-between items-center rounded-lg border border-dashed ' + (!full.box ? ((full.info || full.pie || full.netDay || full.sankey) ? 'hidden bg-light1 ' : 'relative -z-3 bg-panel border-bbgray3 ') : 'bg-light2 border-light2 ')}>
          <BoxPlot trans={logs} isIncome={graph4Income} root={graph4Root} full={full.box} toggleFull={() => setFull({ ...full, box: !full.box })} />
          <GraphControl 
            full={full.box}
            toggle={ !full.box ?
              <>
                <button className={'text-sm z-200 mx-0.5 rounded-lg hover:bg-highlight px-0.5 ' + (graph4Income ? 'bg-primary3 ' : '')} onClick={() => {setGraph4Income(true); setGraph4Root(null)}}>Income</button>
                <button className={'text-sm z-200 mx-0.5 rounded-lg hover:bg-highlight px-0.5 ' + (!graph4Income ? 'bg-primary3 ' : '')} onClick={() => {setGraph4Income(false); setGraph4Root(null)}}>Expense</button>
              </>
              : <></>
            }
          >
            { !full.box ?
               <select className='text-sm h-5' onChange={handleRoot}>
               <option value={''}>All</option>
               { logs
                 .filter(l => (l.amount * (graph4Income ? 1 : -1)) > 0)
                 .map(l => l.category.split('>')[0])
                 .filter((val, ind, arr) => arr.indexOf(val) === ind)
                 .map(r => <option key={r} value={r}>{ r }</option>)
               }
             </select>
             : <></>
            }
           
          </GraphControl>
        </div>

        <div className={'w-3/5 h-[calc(100%-0.5rem)] m-0.5 flex flex-col justify-between items-center rounded-lg border border-dashed ' + (!full.sankey ? ((full.box || full.pie || full.netDay || full.info) ? 'hidden bg-light1 ' : 'relative -z-3 bg-panel border-bbgray3 ') : 'bg-light2 border-light2 ')}>
          { graphType5 ? 
            <TreeAlt transactions={logs} full={full.sankey} toggleFull={() => setFull({ ...full, sankey: !full.sankey })}/> 
          : 
            <Sankey transactions={logs} accounts={accounts} full={full.sankey} toggleFull={() => setFull({ ...full, sankey: !full.sankey })} /> 
          }
          <GraphControl full={full.sankey}>
              <GraphButton onClick={toggleGraph5}>
                { !full.sankey ? <img src={'/stats/' + (graphType5 ? 'sankey' : 'tree') + '.svg' } /> : <></> }
              </GraphButton>
          </GraphControl>
        </div>
      </section>
    
    
    </main>
  )
}

interface GraphControlProps {
  children: JSX.Element;
  toggle?: React.ReactNode;
  full: boolean;
}
function GraphControl ({ children, toggle, full }: GraphControlProps) {

  return (
    <menu className={`w-full h-5 flex flex-row justify-between items-center`}>
      <div className={'bg-light1 px-1 rounded-lg flex flex-row items-center ' + (toggle !== undefined ? 'border-b-2 border-b-solid ' : '') + (!full ? 'border-b-bbgray2 ' : 'border-light2 ')}>
        { toggle !== undefined && toggle }
      </div>
      <div className={'bg-light1 px-1 rounded-lg border-b-2 border-b-solid flex flex-row items-center ' + (!full ? 'border-b-bbgray2 ' : 'border-light2 ')}>
        { children }
      </div>
    </menu>
  )
}

interface GraphButtonProps {
  children: JSX.Element;
  onClick: () => void;
}
function GraphButton ({ children, onClick }: GraphButtonProps) {

  return (
    <button className='relative z-200 mx-0.5 rounded-lg hover:bg-highlight px-0.5 ' onClick={onClick}>
      { children }
    </button>
  )
}