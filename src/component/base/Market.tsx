

export default function Market() {
  
  return (
    <div className='page-root'>
      <menu className="dynamic-menu">
        <div className="dynamic-menu-main">
          <button>
            <img src="/assets.svg" /> Assets
          </button>
          <button>
            <img src="/search.svg" /> Search
          </button>
        </div>

				<div className="dynamic-menu-main">
					<button>
						<img src="/filter.svg" /> Filter
					</button>
				</div>
			</menu>
      

      <div className='page-main'>
        <p style={{margin: '0 auto'}}>market (work in progress)</p>
      </div>
    </div>
  )
}