
interface ZoomChartProps { children: React.ReactNode; full: boolean; toggleFull: () => void;}
export default function ZoomChart({ children, full, toggleFull }: ZoomChartProps) {

  return (
		<div className={"stats-graph" + (full ? ' graph-fullscreen' : '')} onDoubleClick={toggleFull}>
			{ children }
		</div>
	);
}