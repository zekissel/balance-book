
interface ZoomChartProps { children: React.ReactNode; full: boolean; toggleFull: () => void;}
export default function ZoomChart({ children, full, toggleFull }: ZoomChartProps) {

  return (
		<>
			{ // add overlay for close
				// placeholder so graph icon/button stays in same spot
				full && (
					<div className='w-full h-full '>
						
					</div>
				)
			}

			<div className={'w-full h-full ' + (full ? 'absolute z-100 top-0 left-0 bg-dim ' : '')} onDoubleClick={toggleFull} >
				{/* full && <div className='absolute top-4 left-4 z-120 h-8 w-8 ' onClick={toggleFull}><img height={32} width={32} className='bg-light1' src='misc/x.svg' /></div> */}
				{ children }
			</div>
		</>
	);
}