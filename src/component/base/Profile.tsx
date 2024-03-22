import { useState } from "react"

interface ProfileProps { logout: () => void }
export default function Profile ({ logout }: ProfileProps) {





  const [stateFinancial, setStateFinancial] = useState(true)

  return (
    <div className='page-root'>
      <menu className='dynamic-menu'>
        <div className='dynamic-menu-main'>
          <button id={stateFinancial ? 'dynamic-menu-current' : undefined} onClick={() => setStateFinancial(true)}>Financial</button>
          <button id={!stateFinancial ? 'dynamic-menu-current' : undefined} onClick={() => setStateFinancial(false)}>Personal</button>
        </div>

        <div className='dynamic-menu-main'>
          <button>Lock</button>
          <button onClick={logout}>Logout</button>
        </div>
      </menu>

      <div className='page-main'>

        { stateFinancial ?
          <div className='profile-financial'>
            <p>connect bank account with link</p>
          </div>
          :
          <div className='profile-personal'>
            <input type='text' placeholder='Name' />
            <input type='text' placeholder='Email' />

          </div>
        }
        

      </div>
    </div>
  )
}