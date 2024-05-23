

interface MenuProps {
  leftPanel: JSX.Element;
  rightPanel: JSX.Element;
}
export default function Menu({ leftPanel, rightPanel }: MenuProps) {


  return (
    <menu className='h-12 w-full m-0 p-0 flex flex-row items-center justify-between bg-light1 border-b-primary border-b-solid border-b-2'>

      <div className='mx-2 flex flex-row'>
        {leftPanel}
      </div>
      
      <div className='mx-2 flex flex-row'>
        {rightPanel}
      </div>

    </menu>
  )
}

export function MenuButton({ onClick, children, active, filterActive, disabled }: { onClick: () => void, children: JSX.Element, active: boolean, filterActive?: boolean, disabled?: boolean }) {
  const filterStyle = { backgroundColor: `#abc` };
  return (
    <button onClick={onClick} className={'h-8 m-1 px-3 py-1 rounded-xl hover:bg-highlight flex flex-row border-b-dark2 border-b-solid border-b-2 overflow-hidden ' + (active ? 'bg-highlight' : 'bg-light1')} style={filterActive === true ? filterStyle : undefined} disabled={disabled}>
      {children}
    </button>
  )
}