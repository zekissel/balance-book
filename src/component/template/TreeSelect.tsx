import { useMemo, useState } from 'react';
import { ExpenseLeaf, IncomeLeaf, Account } from '../../typedef';
import '../../styles/Select.css';
import { CrossLeaf } from '../transaction/EditMultiLog';

type CategoryBase = typeof ExpenseLeaf | typeof IncomeLeaf | Account[] | typeof CrossLeaf;
function isAccount(tbd: CategoryBase): tbd is Account[] {
	return (tbd as Account[]).length !== undefined;
}
function isExpense(tbd: CategoryBase): tbd is typeof ExpenseLeaf {
	return (tbd as typeof ExpenseLeaf).Home !== undefined;
}
function isIncome(tbd: CategoryBase): tbd is typeof IncomeLeaf {
	return (tbd as typeof IncomeLeaf).FinanceIncome !== undefined;
}

interface SelectProps {
	value: string[];
	options: typeof ExpenseLeaf | typeof IncomeLeaf | Account[] | typeof CrossLeaf;
	onChange: (value: string[]) => void;
	multi: boolean;
	option2?: typeof ExpenseLeaf | typeof IncomeLeaf;
	lower?: boolean;
}
export default function TreeSelect({ value, options, onChange, multi, option2 }: SelectProps) {
	const [dropdown, setDropdown] = useState(false);

	const handleClick = (val: string) => {
		const replace = multi ? value.filter((v) => !v.includes(val)) : [];
		const addValue = multi ? value.concat(val) : [val];

		if (value.includes(val)) onChange(replace);
		else onChange(addValue);
	};

	const handleRootClick = (root: string) => {
		if (isAccount(options)) {
			const selected = acctValues.findIndex((c) => c.includes(`${root}:`)) !== -1;
			const replace = value.filter(
				(v) =>
					!options
						.filter((a) => a.account_type === root)
						.map((a) => a.id)
						.includes(v),
			);
			const addValue = value.concat(
				options.filter((a) => a.account_type === root).map((a) => a.id),
			);

			if (selected) onChange(replace);
			else onChange(addValue);
			return;
		}
		const selected = value.findIndex((c) => c.includes(`${root}>`)) !== -1;
		const replace = value.filter((v) => !v.includes(`${root}`));
		
		const incLeaves = (option2 && isIncome(option2) && Object.keys(IncomeLeaf).includes(root)) ? option2[root as keyof typeof IncomeLeaf] : [];
		const expLeaves = ((isExpense(options) && Object.keys(ExpenseLeaf).includes(root)) ? options[root as keyof typeof ExpenseLeaf] : []);
		
		const addValue = value.concat(
			expLeaves.map((subOption) => `${root}>${subOption}`)
		).concat(
			incLeaves.map((subOption) => `${root}>${subOption}`)
		);

		if (selected) onChange(replace);
		else onChange(addValue);
	};

	const acctTypes = useMemo(() => {
		if (isAccount(options)) {
			return options
				.map((key) => key.account_type)
				.filter((val, ind, arr) => arr.indexOf(val) === ind);
		}
		return [];
	}, [options]);
	const rootSelected = (root: string) => {
		if (!isAccount(options)) return false;
		const selected = options.filter((o) => value.includes(o.id));
		return selected.length > 0 && selected.map((a) => `${a.account_type}`).includes(root);
	};
	const acctValues = useMemo(() => {
		if (isAccount(options)) {
			return options
				.filter((a) => value.includes(a.id))
				.map((a) => `${a.account_type}:${a.account_name}`);
		}
		return [];
	}, [options, value]);

	const outputVal = useMemo(() => {
		return isAccount(options)
			? acctValues
			: multi === true
				? value.filter((v) => v !== 'X')
				: value;
	}, [options, value]);

	return (
		<div className="custom-select">
			<input
				type="text"
				placeholder={isAccount(options) ? 'Account' : 'Category'}
				value={(value.includes('X') ? ['(Exclude)'] : []).concat(
					outputVal.length > 1 ? [`${outputVal.length} selected`] : outputVal,
				)}
				onClick={() => setDropdown(!dropdown)}
				onBlur={() => setDropdown(false)}
				readOnly
			/>

			{dropdown && (
				<ul className="dropdown">
					{!isAccount(options) &&
						Object.keys(options).map((key, index) => (
							<li
								key={index}
								className="dropdown-li"
								style={
									value.findIndex((c) => c.includes(`${key}>`)) !== -1 ? selectedStyle : undefined
								}
								onMouseDown={() => multi && handleRootClick(`${key}`)}
							>
								{key}&gt;
								<div className="option-container">
									{isExpense(options)
										? options[key as keyof typeof ExpenseLeaf].map((subOption) => (
												<div
													className="tree-option"
													key={subOption}
													style={value.includes(`${key}>${subOption}`) ? selectedStyle : undefined}
													onMouseDown={(e) => {
														handleClick(`${key}>${subOption}`);
														e.stopPropagation();
													}}
												>
													{subOption}
												</div>
											))
										: (isIncome(options) ? options[key as keyof typeof IncomeLeaf] : options[key as keyof typeof CrossLeaf]).map((subOption) => (
												<div
													className="tree-option"
													key={subOption}
													style={value.includes(`${key}>${subOption}`) ? selectedStyle : undefined}
													onMouseDown={(e) => {
														handleClick(`${key}>${subOption}`);
														e.stopPropagation();
													}}
												>
													{subOption}
												</div>
											))}
								</div>
							</li>
						))}
					{option2 &&
						Object.keys(option2).map((key, index) => (
							<li
								key={index}
								className="dropdown-li"
								style={
									value.findIndex((c) => c.includes(`${key}>`)) !== -1 ? selectedStyle : undefined
								}
								onMouseDown={() => multi && handleRootClick(`${key}`)}
							>
								{key}&gt;
								<div className="option-container">
									{isExpense(option2)
										? option2[key as keyof typeof ExpenseLeaf].map((subOption) => (
												<div
													className="tree-option"
													key={subOption}
													style={value.includes(`${key}>${subOption}`) ? selectedStyle : undefined}
													onMouseDown={(e) => {
														handleClick(`${key}>${subOption}`);
														e.stopPropagation();
													}}
												>
													{subOption}
												</div>
											))
										: option2[key as keyof typeof IncomeLeaf].map((subOption) => (
												<div
													className="tree-option"
													key={subOption}
													style={value.includes(`${key}>${subOption}`) ? selectedStyle : undefined}
													onMouseDown={(e) => {
														handleClick(`${key}>${subOption}`);
														e.stopPropagation();
													}}
												>
													{subOption}
												</div>
											))}
								</div>
							</li>
						))}
					{isAccount(options) &&
						acctTypes.map((key, index) => (
							<li
								key={index}
								className="dropdown-li"
								style={rootSelected(`${key}`) ? selectedStyle : undefined}
								onMouseDown={() => multi && handleRootClick(`${key}`)}
							>
								{`${key}:`}
								<div className="option-container">
									{options
										.filter((a) => a.account_type === key)
										.map((subOption) => (
											<div
												className="tree-option"
												key={subOption.id}
												style={value.includes(`${subOption.id}`) ? selectedStyle : undefined}
												onMouseDown={(e) => {
													handleClick(`${subOption.id}`);
													e.stopPropagation();
												}}
											>{`${subOption.account_name}`}</div>
										))}
								</div>
							</li>
						))}
				</ul>
			)}
		</div>
	);
}

const selectedStyle = { backgroundColor: '#91d2b3' };
