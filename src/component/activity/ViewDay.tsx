import Draggable from 'react-draggable';
import { useMemo, useRef } from 'react';
import { Day } from '../../typedef';
import '../../styles/ViewDay.css';

interface ViewDayProps {
	day: Day;
	toggle: () => void;
}
export default function ViewDay({ day, toggle }: ViewDayProps) {
	const netTransaction = useMemo(() => {
		return day.transactions.reduce((acc, t) => acc + t.amount, 0);
	}, [day.transactions]);

	const box = useRef<HTMLDivElement>(null);
	return (
		<Draggable handle=".handle" nodeRef={box}>
			<div id="view-day-root" ref={box}>
				<h4>{day.date.toDateString()}</h4>

				{netTransaction !== 0 && (
					<h3 className={netTransaction > 0 ? 'view-day-positive' : 'view-day-negative'}>
						{netTransaction > 0 ? `+$${netTransaction / 100}` : `-$${-netTransaction / 100}`}
					</h3>
				)}

				<ol className="view-day-list">
					{day.transactions.map((t, i) => (
						<li key={i} className="view-day-item">
							<span className="view-day-source">{t.company}</span>
							<span className="view-day-amount">
								{t.amount < 0 ? `-$` : `+$`}
								{Math.abs(t.amount / 100)}
							</span>
							<span className="view-day-desc">{t.desc}</span>
						</li>
					))}

					{day.transactions.length === 0 && <li>No transactions</li>}
				</ol>

				<span>
					<img className="handle" draggable={false} src="/move-arrow.svg" />
					<img src="x.svg" onClick={toggle} />
				</span>
			</div>
		</Draggable>
	);
}
