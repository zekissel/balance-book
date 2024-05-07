import { useState } from "react"
import Menu, { MenuButton } from "../Menu"

interface MarketProps { }
export default function Market({}: MarketProps) {

  enum UIState { Stocks, Crypto, Other, Search }
  const [state, setState] = useState<UIState>(UIState.Stocks);

  return (
    <div className='w-full'>
      <Menu
        leftPanel={
          <>
            <MenuButton onClick={() => setState(UIState.Stocks)} children={<><img src='/menu/stocks.svg' draggable={false} /> Stocks</>} active={state === UIState.Stocks} />
            <MenuButton onClick={() => setState(UIState.Crypto)} children={<><img src='/menu/crypto.svg' draggable={false} /> Crypto</>} active={state === UIState.Crypto} />
            <MenuButton onClick={() => setState(UIState.Other)} children={<><img src='/menu/other.svg' draggable={false} /> Other</>} active={state === UIState.Other} />
            <MenuButton onClick={() => setState(UIState.Search)} children={<><img src='/menu/search.svg' draggable={false} /> Search</>} active={state === UIState.Search} />
            
          </>
        }
        rightPanel={
          <>
            <MenuButton onClick={() => {}} children={<><img src='/menu/filter.svg' draggable={false} />{' '}Filters</>} active={false} />
          </>
        }
      />
      
      { state === UIState.Stocks &&
        <>stocks</>
      }

    </div>
  )
}