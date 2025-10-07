"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAthlete(id: string) {
	try {
		const supabase = await createClient();

		const { data: athlete, error } = await (supabase as any)
			.from("athletes")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching athlete:", error);
			return null;
		}

		return athlete;
	} catch (error) {
		console.error("Unexpected error in getAthlete:", error);
		return null;
	}
}

export async function getAllAthletes() {
	try {
		const supabase = await createClient();

		const { data: athletes, error } = await (supabase as any)
			.from("athletes")
			.select("*")
			.order("id", { ascending: false });

		if (error) {
			console.error("Error fetching athletes:", error);
			return [];
		}

		return athletes || [];
	} catch (error) {
		console.error("Unexpected error in getAllAthletes:", error);
		return [];
	}
}

export async function getAthletesWithFilters(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = (supabase as any)
			.from("athletes")
			.select("*", { count: "exact" });

		// Apply filters with proper operator support
		filters.forEach((filter) => {
			if (filter.values && filter.values.length > 0) {
				const values = filter.values;
				const operator = filter.operator || "is";
				const columnId = filter.columnId;

				// Apply filter based on column type and operator
				switch (columnId) {
					case "full_name":
					case "state":
					case "contact_email":
					case "discord_channel_url":
					case "high_school":
						// Text fields - support contains/does not contain
						if (operator === "contains") {
							query = query.ilike(columnId, `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not(columnId, "ilike", `%${values[0]}%`);
						}
						break;

					case "graduation_year":
					case "gpa":
					case "sat_score":
					case "act_score":
						// Number fields - support various operators
						if (operator === "is") {
							query = query.eq(columnId, values[0]);
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", values[0]);
						} else if (operator === "greater than") {
							query = query.gt(columnId, values[0]);
						} else if (operator === "less than") {
							query = query.lt(columnId, values[0]);
						} else if (operator === "is between") {
							query = query.gte(columnId, values[0]).lte(columnId, values[1]);
						} else if (operator === "is not between") {
							query = query.or(
								`${columnId}.lt.${values[0]},${columnId}.gt.${values[1]}`,
							);
						} else if (operator === "is any of") {
							query = query.in(columnId, values);
						} else if (operator === "is none of") {
							query = query.not(columnId, "in", `(${values.join(",")})`);
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
			query = query.order("id", { ascending: false });
		}

		// Apply pagination
		const from = page * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching athletes with filters:", error);
			return { data: [], count: 0 };
		}

		return { data: data || [], count: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getAthletesWithFilters:", error);
		return { data: [], count: 0 };
	}
}

// Combined query for athletes with faceted data - optimized single call
export async function getAthletesWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = [],
) {
	try {
		const supabase = await createClient();

		// Get main athletes data
		const athletesResult = await getAthletesWithFilters(
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
				let facetQuery = (supabase as any)
					.from("athletes")
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
								case "state":
								case "contact_email":
								case "discord_channel_url":
								case "high_school":
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

								case "graduation_year":
								case "gpa":
								case "sat_score":
								case "act_score":
									if (operator === "is") {
										facetQuery = facetQuery.eq(filterColumnId, values[0]);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											values[0],
										);
									} else if (operator === "greater than") {
										facetQuery = facetQuery.gt(filterColumnId, values[0]);
									} else if (operator === "less than") {
										facetQuery = facetQuery.lt(filterColumnId, values[0]);
									} else if (operator === "is between") {
										facetQuery = facetQuery
											.gte(filterColumnId, values[0])
											.lte(filterColumnId, values[1]);
									} else if (operator === "is not between") {
										facetQuery = facetQuery.or(
											`${filterColumnId}.lt.${values[0]},${filterColumnId}.gt.${values[1]}`,
										);
									} else if (operator === "is any of") {
										facetQuery = facetQuery.in(filterColumnId, values);
									} else if (operator === "is none of") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"in",
											`(${values.join(",")})`,
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
					if (value) {
						const key = String(value);
						facetMap.set(key, (facetMap.get(key) || 0) + 1);
					}
				});

				facetedData[columnId] = facetMap;
			}),
		);

		return {
			athletes: athletesResult.data,
			totalCount: athletesResult.count,
			facetedData,
		};
	} catch (error) {
		console.error("Unexpected error in getAthletesWithFaceted:", error);
		return {
			athletes: [],
			totalCount: 0,
			facetedData: {},
		};
	}
}

export async function getAthletesFaceted(
	columnId: string,
	filters: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = (supabase as any)
			.from("athletes")
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
						case "state":
						case "contact_email":
						case "discord_channel_url":
						case "high_school":
							if (operator === "contains") {
								query = query.ilike(filterColumnId, `%${values[0]}%`);
							} else if (operator === "does not contain") {
								query = query.not(filterColumnId, "ilike", `%${values[0]}%`);
							}
							break;

						case "graduation_year":
						case "gpa":
						case "sat_score":
						case "act_score":
							if (operator === "is") {
								query = query.eq(filterColumnId, values[0]);
							} else if (operator === "is not") {
								query = query.not(filterColumnId, "eq", values[0]);
							} else if (operator === "greater than") {
								query = query.gt(filterColumnId, values[0]);
							} else if (operator === "less than") {
								query = query.lt(filterColumnId, values[0]);
							} else if (operator === "is between") {
								query = query
									.gte(filterColumnId, values[0])
									.lte(filterColumnId, values[1]);
							} else if (operator === "is not between") {
								query = query.or(
									`${filterColumnId}.lt.${values[0]},${filterColumnId}.gt.${values[1]}`,
								);
							} else if (operator === "is any of") {
								query = query.in(filterColumnId, values);
							} else if (operator === "is none of") {
								query = query.not(
									filterColumnId,
									"in",
									`(${values.join(",")})`,
								);
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
			if (value) {
				const key = String(value);
				facetedMap.set(key, (facetedMap.get(key) || 0) + 1);
			}
		});

		return facetedMap;
	} catch (error) {
		console.error("Unexpected error in getAthletesFaceted:", error);
		return new Map<string, number>();
	}
}

// Server-side prefetch functions for page-level prefetching
export async function prefetchAthletesTableDataServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return await getAthletesWithFilters(filters, page, pageSize, sorting);
}

export async function prefetchAthletesFacetedServer(
	columnId: string,
	filters: any[] = [],
) {
	return await getAthletesFaceted(columnId, filters);
}

// Server-side prefetch for combined athletes+faceted data
export async function prefetchAthletesWithFacetedServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = [],
) {
	return await getAthletesWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}
