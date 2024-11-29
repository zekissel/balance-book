

export interface Filter {
	type_: number | null;
	start_date: Date | null;
	end_date: Date | null;
  store: string[];
	category: string[];
	low_amount: number;
	high_amount: number;
	account: string[];
}

export const empty_filter: Filter = {
  type_: null,
  start_date: null,
  end_date: null,
  store: [],
  category: [],
  low_amount: 0,
  high_amount: 0,
  account: [],
};

export const anyFiltersActive = (filters: Filter): boolean => {
  return filters.type_ !== null || filters.start_date !== null || filters.end_date !== null || filters.store.length > 0 || filters.category.length > 0 || filters.low_amount !== 0 || filters.high_amount !== 0 || filters.account.length > 0;
}