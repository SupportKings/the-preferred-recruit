"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCoach(id: string) {
	try {
		const supabase = await createClient();

		const { data: coach, error } = await supabase
			.from("coaches")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching coach:", error);
			return null;
		}

		return coach;
	} catch (error) {
		console.error("Unexpected error in getCoach:", error);
		return null;
	}
}

export async function getAllCoaches() {
	try {
		const supabase = await createClient();

		const { data: coaches, error } = await supabase
			.from("coaches")
			.select("*")
			.order("full_name", { ascending: true });

		if (error) {
			console.error("Error fetching coaches:", error);
			return [];
		}

		return coaches || [];
	} catch (error) {
		console.error("Unexpected error in getAllCoaches:", error);
		return [];
	}
}

export async function getCoachesWithFilters(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = supabase.from("coaches").select("*", { count: "exact" });

		// Apply filters with proper operator support
		filters.forEach((filter) => {
			if (filter.values && filter.values.length > 0) {
				const values = filter.values;
				const operator = filter.operator || "is";
				const columnId = filter.columnId;

				// Apply filter based on column type and operator
				switch (columnId) {
					case "full_name":
					case "email":
					case "instagram_profile":
						// Text fields - support contains/does not contain
						if (operator === "contains") {
							query = query.ilike(columnId, `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not(columnId, "ilike", `%${values[0]}%`);
						}
						break;

					case "primary_specialty":
						// Enum field - support is/is not
						if (operator === "is") {
							query = query.eq(columnId, values[0]);
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", values[0]);
						}
						break;
				}
			}
		});

		// Apply sorting
		if (sorting.length > 0) {
			const sort = sorting[0];
			query = query.order(sort.id, { ascending: !sort.desc });
		} else {
			query = query.order("full_name", { ascending: true });
		}

		// Apply pagination
		const from = page * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching coaches with filters:", error);
			return { data: [], count: 0 };
		}

		return { data: data || [], count: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getCoachesWithFilters:", error);
		return { data: [], count: 0 };
	}
}

// Combined query for coaches with faceted data - optimized single call
export async function getCoachesWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["primary_specialty"],
) {
	try {
		const supabase = await createClient();

		// Get main coaches data
		const coachesResult = await getCoachesWithFilters(
			filters,
			page,
			pageSize,
			sorting,
		);

		// Get faceted data for each requested column
		const facetedData: Record<string, Map<string, number>> = {};

		// Fetch faceted counts for each column in parallel
		await Promise.all(
			facetedColumns.map(async (columnId) => {
				let facetQuery = supabase
					.from("coaches")
					.select(columnId, { count: "exact" });

				// Apply existing filters (excluding the column we're faceting)
				filters
					.filter((filter) => filter.columnId !== columnId)
					.forEach((filter) => {
						if (filter.values && filter.values.length > 0) {
							const values = filter.values;
							const operator = filter.operator || "is";
							const filterColumnId = filter.columnId;

							// Apply same operator logic as main query
							switch (filterColumnId) {
								case "full_name":
								case "email":
								case "instagram_profile":
									if (operator === "contains") {
										facetQuery = facetQuery.ilike(
											filterColumnId,
											`%${values[0]}%`,
										);
									} else if (operator === "does not contain") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"ilike",
											`%${values[0]}%`,
										);
									}
									break;

								case "primary_specialty":
									if (operator === "is") {
										facetQuery = facetQuery.eq(filterColumnId, values[0]);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											values[0],
										);
									}
									break;
							}
						}
					});

				const { data: facetData, error: facetError } = await facetQuery;

				if (facetError) {
					console.error(
						`Error fetching faceted data for ${columnId}:`,
						facetError,
					);
					facetedData[columnId] = new Map();
					return;
				}

				// Convert to Map format
				const facetMap = new Map<string, number>();
				facetData?.forEach((item: any) => {
					const value = item[columnId];
					if (value !== null && value !== undefined) {
						const key = String(value);
						facetMap.set(key, (facetMap.get(key) || 0) + 1);
					}
				});

				facetedData[columnId] = facetMap;
			}),
		);

		return {
			coaches: coachesResult.data,
			totalCount: coachesResult.count,
			facetedData,
		};
	} catch (error) {
		console.error("Unexpected error in getCoachesWithFaceted:", error);
		return {
			coaches: [],
			totalCount: 0,
			facetedData: {},
		};
	}
}

export async function getCoachesFaceted(columnId: string, filters: any[] = []) {
	try {
		const supabase = await createClient();

		let query = supabase
			.from("coaches")
			.select(columnId, { count: "exact" });

		// Apply existing filters (excluding the column we're faceting)
		filters
			.filter((filter) => filter.columnId !== columnId)
			.forEach((filter) => {
				if (filter.values && filter.values.length > 0) {
					const values = filter.values;
					const operator = filter.operator || "is";
					const filterColumnId = filter.columnId;

					// Apply same operator logic as main query
					switch (filterColumnId) {
						case "full_name":
						case "email":
						case "instagram_profile":
							if (operator === "contains") {
								query = query.ilike(filterColumnId, `%${values[0]}%`);
							} else if (operator === "does not contain") {
								query = query.not(filterColumnId, "ilike", `%${values[0]}%`);
							}
							break;

						case "primary_specialty":
							if (operator === "is") {
								query = query.eq(filterColumnId, values[0]);
							} else if (operator === "is not") {
								query = query.not(filterColumnId, "eq", values[0]);
							}
							break;
					}
				}
			});

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching faceted data:", error);
			return new Map<string, number>();
		}

		// Convert to Map format
		const facetedMap = new Map<string, number>();
		data?.forEach((item: any) => {
			const value = item[columnId];
			if (value !== null && value !== undefined) {
				const key = String(value);
				facetedMap.set(key, (facetedMap.get(key) || 0) + 1);
			}
		});

		return facetedMap;
	} catch (error) {
		console.error("Unexpected error in getCoachesFaceted:", error);
		return new Map<string, number>();
	}
}

// Server-side prefetch functions for page-level prefetching
export async function prefetchCoachesTableDataServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return await getCoachesWithFilters(filters, page, pageSize, sorting);
}

export async function prefetchCoachesFacetedServer(
	columnId: string,
	filters: any[] = [],
) {
	return await getCoachesFaceted(columnId, filters);
}

// Server-side prefetch for combined coaches+faceted data
export async function prefetchCoachesWithFacetedServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["primary_specialty"],
) {
	return await getCoachesWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}
