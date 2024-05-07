import { useState } from "react"
import Menu, { MenuButton } from "../Menu"

interface SettingsProps { }
export default function Settings({}: SettingsProps) {

  enum UIState { General, Advanced }
  const [state, setState] = useState<UIState>(UIState.General);

  return (
    <div className='w-full'>
      <Menu
        leftPanel={
          <>
            <MenuButton onClick={() => setState(UIState.General)} children={<><img src='/menu/general.svg' draggable={false} /> General</>} active={state === UIState.General} />
            <MenuButton onClick={() => setState(UIState.Advanced)} children={<><img src='/menu/advanced.svg' draggable={false} /> Advanced</>} active={state === UIState.Advanced} />
          </>
        }
        rightPanel={
          <>
            <MenuButton onClick={() => {}} children={<><img src='/menu/reset.svg' draggable={false} /> Restore Defaults</>} active={false} />
          </>
        }
      />
      
      { state === UIState.General &&
        <>general</>
      }

      { state === UIState.Advanced &&
        <>advanced</>
      }

    </div>
  )
}