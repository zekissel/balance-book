import { useState } from "react";
import { User } from "../../typedef";
import Personal from "./Personal";
import Financial from "./Financial";
import Menu, { MenuButton } from "../Menu";
import { useNavigate } from "react-router-dom";

interface ProfileProps { user: User, logout: () => void }
export default function Profile({ user, logout }: ProfileProps) {

  const navigate = useNavigate();
  enum UIState { Personal, Financial }
  const [state, setState] = useState<UIState>(UIState.Financial);
  const signOut = () => {
    logout();
    navigate('/');
  }

  return (
    <div className='w-full'>
      <Menu
        leftPanel={
          <>
            <MenuButton onClick={() => setState(UIState.Financial)} children={<><img src='/menu/financial.svg' /> Financial</>} active={state === UIState.Financial} />
            <MenuButton onClick={() => setState(UIState.Personal)} children={<><img src='/menu/personal.svg' /> Personal</>} active={state === UIState.Personal} />
          </>
        }
        rightPanel={
          <MenuButton onClick={signOut} children={<><img src='/menu/logout.svg' /> Logout</>} active={false} />
        }
      />

      { state === UIState.Financial &&
        <Financial user={user} />
      }

      { state === UIState.Personal &&
        <Personal user={user} logout={logout} />
      }

    </div>
  )
}