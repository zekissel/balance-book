import React, { useState } from 'react';
import {
	Filter,
	ExpenseRoot,
	ExpenseLeaf,
	IncomeRoot,
	IncomeLeaf,
	getEnumKeys,
	Account,
} from '../../typedef';
import { addDays } from '../../typeassist';
import '../../styles/Filter.css';
import TreeSelect from './TreeSelect';

interface FilterProps {
	accounts: Account[];
	toggle: () => void;
	filters: Filter;
	setFilters: React.Dispatch<React.SetStateAction<Filter>>;
}
export default function FilterGUI({ accounts, toggle, filters, setFilters }: FilterProps) {
	const [showStartDate, setShowStartDate] = useState(filters.startDate !== null);
	const toggleStartDate = () => setShowStartDate(!showStartDate);
	const [showEndDate, setShowEndDate] = useState(filters.endDate !== null);
	const toggleEndDate = () => setShowEndDate(!showEndDate);
	const [showCategory, setShowCategory] = useState(false);
	const toggleCategory = () => setShowCategory(!showCategory);

	const [showAccounts, setShowAccounts] = useState(false);
	const toggleAccounts = () => setShowAccounts(!showAccounts);

	const handleLowAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		const am = e.target.value;
		if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
			setFilters({ ...filters, lowAmount: am });
			sessionStorage.setItem('filter.low', am);
		}
	};
	const handleHighAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
		const am = e.target.value;
		if (!am || am.match(/^\d{1,}(\.\d{0,2})?$/)) {
			setFilters({ ...filters, highAmount: am });
			sessionStorage.setItem('filter.high', am);
		}
	};

	const handleType = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setFilters({ ...filters, type: e.target.value as string });
		sessionStorage.setItem('filter.type', e.target.value);
	};

	const voidStartDate = () => {
		toggleStartDate();
		setFilters({ ...filters, startDate: null });
		sessionStorage.removeItem('filter.start');
	};
	const handleStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
		const date = addDays(
			new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')),
			0,
		);
		setFilters({ ...filters, startDate: date });
		sessionStorage.setItem('filter.start', date.toDateString());
	};

	const voidEndDate = () => {
		toggleEndDate();
		setFilters({ ...filters, endDate: null });
		sessionStorage.removeItem('filter.end');
	};
	const handleEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
		const date = addDays(
			new Date(new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' ')),
			0,
		);
		setFilters({ ...filters, endDate: date });
		sessionStorage.setItem('filter.end', date.toDateString());
	};

	const excludeCategory = () => {
		if (filters.category.includes('X')) {
			const no_ex = filters.category.filter((c) => c !== 'X');
			setFilters({ ...filters, category: no_ex });
			sessionStorage.setItem('filter.category', no_ex.join(' '));
		} else {
			const ex = [...filters.category, 'X'];
			setFilters({ ...filters, category: ex });
			sessionStorage.setItem('filter.category', ex.join(' '));
		}
	};
	const voidCategory = () => {
		toggleCategory();
		setFilters({ ...filters, category: [] });
		sessionStorage.removeItem('filter.category');
	};/*
	const handleCategory = (e: any) => {
		if (filters.category.includes(e.target.value)) {
			const newCategories = filters.category.filter((c) => c !== e.target.value);
			setFilters({ ...filters, category: newCategories });
			sessionStorage.setItem('filter.category', newCategories.join(' '));
		} else {
			const newCategories = [...filters.category, e.target.value];
			setFilters({ ...filters, category: newCategories });
			sessionStorage.setItem('filter.category', newCategories.join(' '));
		}
	};*/
	const handleCategory = (e: string[]) => {
		setFilters({ ...filters, category: e });
		sessionStorage.setItem('filter.category', e.join(' '));
	}

	const handleSource = (e: React.ChangeEvent<HTMLInputElement>) => {
		const sources = e.target.value.split(',');
		setFilters({ ...filters, source: sources });
		sessionStorage.setItem('filter.source', sources.join(' '));
	};

	const voidAccounts = () => {
		//toggleAccounts();
		setFilters({ ...filters, accounts: [] });
		sessionStorage.removeItem('filter.accounts');
	};/*
	const handleAccounts = (e: any) => {
		if (filters.accounts.includes(e.target.value)) {
			const newAccounts = filters.accounts.filter((a) => a !== e.target.value);
			setFilters({ ...filters, accounts: newAccounts });
			sessionStorage.setItem('filter.accounts', newAccounts.join(' '));
		} else {
			const newAccounts = [...filters.accounts, e.target.value];
			setFilters({ ...filters, accounts: newAccounts });
			sessionStorage.setItem('filter.accounts', newAccounts.join(' '));
		}
	};*/
	const handleAccounts = (e: string[]) => {
		setFilters({ ...filters, accounts: e });
		sessionStorage.setItem('filter.accounts', e.join(' '));
	}
	const excludeAccounts = () => {
		if (filters.accounts.includes('X')) {
			const no_ex = filters.accounts.filter((c) => c !== 'X');
			setFilters({ ...filters, accounts: no_ex });
			sessionStorage.setItem('filter.accounts', no_ex.join(' '));
		} else {
			const ex = [...filters.accounts, 'X'];
			setFilters({ ...filters, accounts: ex });
			sessionStorage.setItem('filter.accounts', ex.join(' '));
		}
	};

	const resetFilters = () => {
		setFilters({
			type: `all`,
			startDate: null,
			endDate: null,
			category: [],
			source: [''],
			lowAmount: '0',
			highAmount: '0',
			accounts: [],
		});
		setShowStartDate(false);
		setShowEndDate(false);
		setShowCategory(false);
		sessionStorage.removeItem('filter.type');
		sessionStorage.removeItem('filter.start');
		sessionStorage.removeItem('filter.end');
		sessionStorage.removeItem('filter.category');
		sessionStorage.removeItem('filter.source');
		sessionStorage.removeItem('filter.low');
		sessionStorage.removeItem('filter.high');
		sessionStorage.removeItem('filter.accounts');
	};

	return (
		<menu className="filter-menu">
			<li>
				<label>Type: </label>
				<select value={filters.type} onChange={handleType}>
					<option value={`all`}>All</option>
					<option value={`expense`}>Expense</option>
					<option value={`income`}>Income</option>
				</select>
			</li>

			<li>
				<label className="filter-menu-togglable" onClick={voidStartDate}>
					Start Date:{' '}
				</label>
				{showStartDate && (
					<input
						type="date"
						value={
							filters.startDate
								? addDays(filters.startDate!, 0).toISOString().substring(0, 10)
								: undefined
						}
						onChange={handleStartDate}
					/>
				)}
				{!showStartDate && <span>None</span>}
			</li>
			<li>
				<label className="filter-menu-togglable" onClick={voidEndDate}>
					End Date:{' '}
				</label>
				{showEndDate && (
					<input
						type="date"
						value={filters.endDate ? filters.endDate.toISOString().substring(0, 10) : undefined}
						onChange={handleEndDate}
					/>
				)}
				{!showEndDate && <span>None</span>}
			</li>

			<li>
				<span className="filter-menu-heading">
					<label>
						Categories:{' '}
					</label>
					<span className="category-img" onClick={voidCategory}>
						<img src="/x.svg" />
					</span>
					<span className="category-img" onClick={excludeCategory}>
						{filters.category.includes('X') ? <img src="/include.svg" /> : <img src="/exclude.svg" />}
					</span>
				</span>
				
				<TreeSelect value={filters.category} options={ExpenseLeaf} onChange={handleCategory} multi={true} option2={IncomeLeaf} />
			</li>

			<li>
				<label>Store/Source: </label>
				<input type="text" value={filters.source} onChange={handleSource} />
			</li>

			<li>
				<label>Low Amount: </label>
				<input type="text" value={filters.lowAmount} onChange={handleLowAmount} />
			</li>
			<li>
				<label>High Amount: </label>
				<input type="text" value={filters.highAmount} onChange={handleHighAmount} />
			</li>

			<li>
				<span className="filter-menu-heading">
					<label>
						Accounts:{' '}
					</label>
					<span className="category-img" onClick={voidAccounts}>
						<img src="/x.svg" />
					</span>
					<span className="category-img" onClick={excludeAccounts}>
						{filters.accounts.includes('X') ? <img src="/include.svg" /> : <img src="/exclude.svg" />}
					</span>
				</span>
				
				<TreeSelect value={filters.accounts} options={accounts} onChange={handleAccounts} multi={true} />
			</li>

			<li className="filter-menu-meta">
				<button id="clear-filters" onClick={resetFilters}>
					Clear Filters
				</button>
				<button onClick={toggle}>Hide</button>
			</li>
		</menu>
	);
}
