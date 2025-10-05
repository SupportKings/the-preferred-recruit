import type { FiltersState } from "@/components/data-table-filter/core/types";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
	SortConfig,
	SupabaseQueryConfig,
	TableRelationship,
} from "../types";

/**
 * Builds a Supabase query with filters, search, and relationships
 */
export function buildSupabaseQuery(
	supabase: SupabaseClient,
	config: SupabaseQueryConfig,
) {
	const {
		table,
		schema = "public",
		select,
		filters,
		searchTerm,
		searchColumns,
		relationships,
		page,
		pageSize,
		sorting,
	} = config;

	// Start with base query
	let query: any = supabase.from(table);

	// Build select statement with relationships
	const selectStatement = buildSelectStatement(select, relationships);
	query = query.select(selectStatement, { count: "exact" });

	// Apply filters
	if (filters && filters.length > 0) {
		query = applyFilters(query, filters);
	}

	// Apply search
	if (searchTerm && searchColumns && searchColumns.length > 0) {
		query = applySearch(query, searchTerm, searchColumns);
	}

	// Apply sorting
	if (sorting && sorting.length > 0) {
		query = applySorting(query, sorting);
	}

	// Apply pagination
	if (page !== undefined && pageSize !== undefined) {
		const from = page * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);
	}

	return query;
}

/**
 * Builds the select statement including relationships
 */
function buildSelectStatement(
	select?: string,
	relationships?: Record<string, TableRelationship>,
): string {
	if (select) return select;

	const selectParts = ["*"];

	if (relationships) {
		Object.entries(relationships).forEach(([key, relation]) => {
			if (relation.type === "single") {
				selectParts.push(`${key}:${relation.table}(*)`);
			} else if (relation.type === "many") {
				selectParts.push(`${key}:${relation.table}(*)`);
			}
		});
	}

	return selectParts.join(",");
}

/**
 * Applies filters to the Supabase query
 */
function applyFilters(query: any, filters: FiltersState) {
	filters.forEach((filter) => {
		const { columnId, type, operator, values } = filter;

		switch (type) {
			case "text":
				if (operator === "contains") {
					query = query.ilike(columnId, `%${values[0]}%`);
				} else if (operator === "does not contain") {
					query = query.not(columnId, "ilike", `%${values[0]}%`);
				}
				break;

			case "option":
				if (operator === "is") {
					query = query.eq(columnId, values[0]);
				} else if (operator === "is not") {
					query = query.neq(columnId, values[0]);
				} else if (operator === "is any of") {
					query = query.in(columnId, values);
				} else if (operator === "is none of") {
					query = query.not(columnId, "in", `(${values.join(",")})`);
				}
				break;

			case "multiOption":
				if (operator === "include any of") {
					query = query.overlaps(columnId, values);
				} else if (operator === "include all of") {
					query = query.contains(columnId, values);
				} else if (operator === "exclude if any of") {
					query = query.not(columnId, "ov", values);
				}
				break;

			case "number": {
				const numValue = Number(values[0]);
				if (operator === "is") {
					query = query.eq(columnId, numValue);
				} else if (operator === "is not") {
					query = query.neq(columnId, numValue);
				} else if (operator === "is greater than") {
					query = query.gt(columnId, numValue);
				} else if (operator === "is greater than or equal to") {
					query = query.gte(columnId, numValue);
				} else if (operator === "is less than") {
					query = query.lt(columnId, numValue);
				} else if (operator === "is less than or equal to") {
					query = query.lte(columnId, numValue);
				} else if (operator === "is between") {
					query = query
						.gte(columnId, numValue)
						.lte(columnId, Number(values[1]));
				}
				break;
			}

			case "date": {
				const dateValue = new Date(values[0]);
				if (operator === "is") {
					query = query.eq(columnId, dateValue.toISOString());
				} else if (operator === "is not") {
					query = query.neq(columnId, dateValue.toISOString());
				} else if (operator === "is after") {
					query = query.gt(columnId, dateValue.toISOString());
				} else if (operator === "is on or after") {
					query = query.gte(columnId, dateValue.toISOString());
				} else if (operator === "is before") {
					query = query.lt(columnId, dateValue.toISOString());
				} else if (operator === "is on or before") {
					query = query.lte(columnId, dateValue.toISOString());
				}
				break;
			}
		}
	});

	return query;
}

/**
 * Applies text search across multiple columns
 */
function applySearch(query: any, searchTerm: string, searchColumns: string[]) {
	if (searchColumns.length === 1) {
		return query.ilike(searchColumns[0], `%${searchTerm}%`);
	}

	// For multiple columns, use or condition
	const searchConditions = searchColumns
		.map((col) => `${col}.ilike.%${searchTerm}%`)
		.join(",");
	return query.or(searchConditions);
}

/**
 * Applies sorting to the Supabase query
 */
function applySorting(query: any, sorting: SortConfig[]) {
	sorting.forEach((sort) => {
		query = query.order(sort.column, { ascending: sort.direction === "asc" });
	});
	return query;
}

/**
 * Builds a query for faceted counts
 */
export function buildFacetedCountQuery(
	supabase: SupabaseClient,
	table: string,
	column: string,
	filters?: FiltersState,
) {
	let query = supabase.from(table).select(column, { count: "exact" });

	// Apply filters excluding the current column
	if (filters) {
		const filteredFilters = filters.filter((f) => f.columnId !== column);
		if (filteredFilters.length > 0) {
			query = applyFilters(query, filteredFilters);
		}
	}

	return query;
}

/**
 * Builds a query for number column min/max values
 */
export function buildMinMaxQuery(
	supabase: SupabaseClient,
	table: string,
	column: string,
	filters?: FiltersState,
) {
	let query = supabase.from(table).select(`
			min_value:${column}(),
			max_value:${column}()
		`);

	// Apply filters excluding the current column
	if (filters) {
		const filteredFilters = filters.filter((f) => f.columnId !== column);
		if (filteredFilters.length > 0) {
			query = applyFilters(query, filteredFilters);
		}
	}

	return query;
}
