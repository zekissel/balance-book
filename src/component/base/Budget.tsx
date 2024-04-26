

export default function Budget() {
  
  return (
    <div className='page-root'>
      <menu className="dynamic-menu">
        <div className="dynamic-menu-main">
          <button>
            <img src="/goals.svg" /> Goals
          </button>
          <button>
            <img src="/repeat.svg" /> Recurring
          </button>
        </div>

				<div className="dynamic-menu-main">
					<button>
						<img src="/budget-add.svg" /> Add Budget
					</button>
				</div>
			</menu>
      

      <div className='page-main'>
        <p style={{margin: '0 auto'}}>budget (work in progress)</p>
      </div>
    </div>
  )
}