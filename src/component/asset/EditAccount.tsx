import { invoke } from '@tauri-apps/api/tauri';
import React, { useState } from 'react';
import { AccountType, Account, User } from '../../typedef';

interface EditAccountProps {
	log: Account | null;
	user: User;
	type: AccountType;
	toggle: () => void;
	cancel: () => void;
	updateAccounts: () => void;
}
export function EditAccount({ log, user, type, toggle, cancel, updateAccounts }: EditAccountProps) {
	const [name, setName] = useState(log ? log.account_name : '');
	const [balance, setBalance] = useState(log ? String(log.balance / 100) : '0');

	async function addAccount() {
		if (name === '' || user.id.length === 0) return;

		const data = {
			id: log ? log.id : undefined,
			userId: user.id,
			accountType: log ? log.account_type : type,
			accountId: name,
			balance: Math.round((Number(balance) + Number.EPSILON) * 100),
			date: new Date().toISOString(),
		};

		if (log) await invoke('fix_account', data);
		else await invoke('new_account', data);
			
		updateAccounts();
		toggle();
	}

	const deleteAccount = () => {
		invoke('remove_account', { id: log!.id });
		
		updateAccounts();
		toggle();
	};

	const updateBalance = (e: React.ChangeEvent<HTMLInputElement>) => {
		const am = e.target.value;
		if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
			setBalance(am);
		}
	};

	return (
		<fieldset className={'new-trans'}>
			<legend>
				{log ? 'Edit' : 'New'} {type.toString()} Account
			</legend>

			<div className="new-trans-main">
				<li>
					<label>Name: </label>
					<input
						type="text"
						value={name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
					/>
				</li>
				<li>
					<label>Balance:</label>
					<input type="text" value={balance} onChange={updateBalance} />
				</li>
			</div>

			{log && (
				<div className="new-trans-main">
					<li>
						<label>Last Update:</label>
						<input type="text" value={log.date} disabled />
					</li>
				</div>
			)}

			<li className="new-trans-meta">
				<button className="new-trans-submit" onClick={addAccount}>
					Save
				</button>
				<button onClick={cancel}>Cancel</button>
				{log && (
					<button className="delete-trans" onClick={deleteAccount}>
						Delete
					</button>
				)}
			</li>
		</fieldset>
	);
}
