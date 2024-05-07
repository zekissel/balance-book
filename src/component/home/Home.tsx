import { useState } from "react"
import Menu, { MenuButton } from "../Menu"

interface HomeProps { }
export default function Home({}: HomeProps) {

  enum UIState { Dashboard, Budget, News }
  const [state, setState] = useState<UIState>(UIState.Dashboard);

  return (
    <div className='w-full'>
      <Menu
        leftPanel={
          <>
            <MenuButton onClick={() => setState(UIState.Dashboard)} children={<><img src='/menu/dashboard.svg' draggable={false} /> Dashboard</>} active={state === UIState.Dashboard} />
            <MenuButton onClick={() => setState(UIState.Budget)} children={<><img src='/menu/budget.svg' draggable={false} /> Budget</>} active={state === UIState.Budget} />
            <MenuButton onClick={() => setState(UIState.News)} children={<><img src='/menu/news.svg' draggable={false} /> News</>} active={state === UIState.News} />
          </>
        }
        rightPanel={
          <>
            <MenuButton onClick={() => {}} children={<a className='flex flex-row' href='https://github.com/zekissel/balance-book' target='_blank' rel='noreferrer nofollow'><img src='/menu/github.svg' draggable={false} />{' '}Source</a>} active={false} />
          </>
        }
      />
      
      { state === UIState.Dashboard &&
        <>dashboard</>
      }

      { state === UIState.Budget &&
        <>budget</>
      }

      { state === UIState.News &&
        <>news</>
      }

    </div>
  )
}