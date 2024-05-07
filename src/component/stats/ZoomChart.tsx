import ReactECharts from 'echarts-for-react';

interface ZoomChartProps {
	full: boolean; 
	toggleFull: () => void; 
	option: any;
}
export default function ZoomChart({ option, full, toggleFull }: ZoomChartProps) {

  return (
		<>
			{ // add overlay for close
				// placeholder so graph icon/button stays in same spot
				full && (
					<div className='w-full h-full '></div>
				)
			}

			<div className={'w-full h-full ' + (full ? 'absolute z-250 top-0 left-0 bg-dim ' : 'relative -z-5 ')} onDoubleClick={toggleFull} >
				{/* full && <div className='absolute top-4 left-4 z-120 h-8 w-8 ' onClick={toggleFull}><img height={32} width={32} className='bg-light1' src='misc/x.svg' /></div> */}
				<ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
			</div>
		</>
	);
}