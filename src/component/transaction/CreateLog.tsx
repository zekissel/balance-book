import { useState } from 'react';
import { EditLog } from './EditLog';
import { Account } from '../../typedef';
import '../../styles/Log.css';

interface CreateLogProps {
	accounts: Account[];
	toggle: () => void;
	updateLog: () => void;
}
export default function CreateLog({ accounts, toggle, updateLog }: CreateLogProps) {
	const [addIncome, setAddIncome] = useState(false);

	return (
		<menu className="new-log">
			<span className="new-log-radio">
				<input
					type="radio"
					name="type"
					value="Expense"
					id="radio-set-expense"
					onChange={() => setAddIncome(false)}
					defaultChecked
				/>
				<label htmlFor="radio-set-expense">Expense</label>

				<input
					type="radio"
					name="type"
					value="Income"
					id="radio-set-income"
					onChange={() => setAddIncome(true)}
				/>
				<label htmlFor="radio-set-income">Income</label>
			</span>

			<EditLog
				log={null}
				accounts={accounts}
				toggle={toggle}
				cancel={toggle}
				updateLog={updateLog}
				isIncome={addIncome}
			/>
		</menu>
	);
}
