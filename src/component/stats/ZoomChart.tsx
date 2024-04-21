
interface ZoomChartProps { children: React.ReactNode; full: boolean; toggleFull: () => void;}
export default function ZoomChart({ children, full, toggleFull }: ZoomChartProps) {

  return (
		<>
			{ // add overlay for close
				// placeholder so graph icon/button stays in same spot
				full && (
					<div className="stats-graph">
						
					</div>
				)
			}

			<div className={"stats-graph" + (full ? ' graph-fullscreen' : '')} onDoubleClick={toggleFull} /*onClick={() => { if (full) toggleFull(); }}*/>
				{ children }
			</div>
		</>
	);
}