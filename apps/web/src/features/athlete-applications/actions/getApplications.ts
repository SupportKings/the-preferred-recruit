"use server";

import { createClient } from "@/utils/supabase/server";

// Helper function to normalize date strings to YYYY-MM-DD format
function normalizeDateValue(value: string): string {
	if (!value) return value;
	// If it's already in YYYY-MM-DD format, return as-is
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return value;
	}
	// Otherwise, parse and convert to YYYY-MM-DD
	try {
		const date = new Date(value);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	} catch {
		return value;
	}
}

export async function getApplication(id: string) {
	try {
		const supabase = await createClient();

		const { data: application, error } = await (supabase as any)
			.from("athlete_applications")
			.select(`
				*,
				athlete:athletes (
					id,
					full_name,
					graduation_year
				),
				university:universities (
					id,
					name,
					state
				),
				program:programs (
					id,
					gender,
					team_url
				)
			`)
			.eq("id", id)
			.eq("is_deleted", false)
			.single();

		if (error) {
			console.error("Error fetching application:", error);
			return null;
		}

		return application;
	} catch (error) {
		console.error("Unexpected error in getApplication:", error);
		return null;
	}
}

export async function getAllApplications() {
	try {
		const supabase = await createClient();

		const { data: applications, error } = await (supabase as any)
			.from("athlete_applications")
			.select(`
				*,
				athlete:athletes (
					id,
					full_name,
					graduation_year
				),
				university:universities (
					id,
					name,
					state
				),
				program:programs (
					id,
					gender,
					team_url
				)
			`)
			.eq("is_deleted", false)
			.order("start_date", { ascending: false });

		if (error) {
			console.error("Error fetching applications:", error);
			return [];
		}

		return applications || [];
	} catch (error) {
		console.error("Unexpected error in getAllApplications:", error);
		return [];
	}
}

export async function getApplicationsWithFilters(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = (supabase as any).from("athlete_applications").select(
			`
				*,
				athlete:athletes (
					id,
					full_name,
					graduation_year
				),
				university:universities (
					id,
					name,
					state
				),
				program:programs (
					id,
					gender,
					team_url
				)
			`,
			{ count: "exact" },
		);

		// Always filter out deleted records
		query = query.eq("is_deleted", false);

		// Apply filters with proper operator support
		filters.forEach((filter) => {
			if (filter.values && filter.values.length > 0) {
				const values = filter.values;
				const operator = filter.operator || "is";
				const columnId = filter.columnId;

				// Apply filter based on column type and operator
				switch (columnId) {
					case "athlete_id":
					case "university_id":
					case "program_id":
						// UUID fields - support is/is not/is any of/is none of
						if (operator === "is") {
							query = query.eq(columnId, values[0]);
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", values[0]);
						} else if (operator === "is any of") {
							query = query.in(columnId, values);
						} else if (operator === "is none of") {
							query = query.not(columnId, "in", `(${values.join(",")})`);
						}
						break;

					case "stage":
						// Enum fields - support is/is not/is any of/is none of
						if (operator === "is") {
							query = query.eq(columnId, values[0]);
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", values[0]);
						} else if (operator === "is any of") {
							query = query.in(columnId, values);
						} else if (operator === "is none of") {
							query = query.not(columnId, "in", `(${values.join(",")})`);
						}
						break;

					case "start_date":
					case "offer_date":
					case "commitment_date":
					case "last_interaction_at":
						// Date fields - support is/is not/is after/is before/is between/is on or after/is on or before
						// Normalize date values to avoid timezone issues
						const normalizedValues = values.map(normalizeDateValue);
						if (operator === "is") {
							query = query.eq(columnId, normalizedValues[0]);
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", normalizedValues[0]);
						} else if (operator === "is after") {
							query = query.gt(columnId, normalizedValues[0]);
						} else if (operator === "is before") {
							query = query.lt(columnId, normalizedValues[0]);
						} else if (operator === "is on or after") {
							query = query.gte(columnId, normalizedValues[0]);
						} else if (operator === "is on or before") {
							query = query.lte(columnId, normalizedValues[0]);
						} else if (operator === "is between") {
							// For "is between", values[0] is start date and values[1] is end date
							if (normalizedValues.length >= 2) {
								query = query
									.gte(columnId, normalizedValues[0])
									.lte(columnId, normalizedValues[1]);
							}
						} else if (operator === "is not between") {
							// For "is not between", values[0] is start date and values[1] is end date
							if (normalizedValues.length >= 2) {
								query = query.or(
									`${columnId}.lt.${normalizedValues[0]},${columnId}.gt.${normalizedValues[1]}`,
								);
							}
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
			query = query.order("start_date", { ascending: false });
		}

		// Apply pagination
		const from = page * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching applications with filters:", error);
			return { data: [], count: 0 };
		}

		return { data: data || [], count: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getApplicationsWithFilters:", error);
		return { data: [], count: 0 };
	}
}

// Combined query for applications with faceted data - optimized single call
export async function getApplicationsWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = [
		"athlete_id",
		"university_id",
		"program_id",
		"stage",
	],
) {
	try {
		const supabase = await createClient();

		// Get main applications data
		const applicationsResult = await getApplicationsWithFilters(
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
					.from("athlete_applications")
					.select(columnId, { count: "exact" })
					.eq("is_deleted", false);

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
								case "athlete_id":
								case "university_id":
								case "program_id":
								case "stage":
									if (operator === "is") {
										facetQuery = facetQuery.eq(filterColumnId, values[0]);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											values[0],
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

								case "start_date":
								case "offer_date":
								case "commitment_date":
								case "last_interaction_at": {
									const normalizedFacetValues = values.map(normalizeDateValue);
									if (operator === "is") {
										facetQuery = facetQuery.eq(
											filterColumnId,
											normalizedFacetValues[0],
										);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											normalizedFacetValues[0],
										);
									} else if (operator === "is after") {
										facetQuery = facetQuery.gt(
											filterColumnId,
											normalizedFacetValues[0],
										);
									} else if (operator === "is before") {
										facetQuery = facetQuery.lt(
											filterColumnId,
											normalizedFacetValues[0],
										);
									} else if (operator === "is on or after") {
										facetQuery = facetQuery.gte(
											filterColumnId,
											normalizedFacetValues[0],
										);
									} else if (operator === "is on or before") {
										facetQuery = facetQuery.lte(
											filterColumnId,
											normalizedFacetValues[0],
										);
									} else if (operator === "is between") {
										if (normalizedFacetValues.length >= 2) {
											facetQuery = facetQuery
												.gte(filterColumnId, normalizedFacetValues[0])
												.lte(filterColumnId, normalizedFacetValues[1]);
										}
									} else if (operator === "is not between") {
										if (normalizedFacetValues.length >= 2) {
											facetQuery = facetQuery.or(
												`${filterColumnId}.lt.${normalizedFacetValues[0]},${filterColumnId}.gt.${normalizedFacetValues[1]}`,
											);
										}
									}
									break;
								}
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
			applications: applicationsResult.data,
			totalCount: applicationsResult.count,
			facetedData,
		};
	} catch (error) {
		console.error("Unexpected error in getApplicationsWithFaceted:", error);
		return {
			applications: [],
			totalCount: 0,
			facetedData: {},
		};
	}
}

export async function getApplicationsFaceted(
	columnId: string,
	filters: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = (supabase as any)
			.from("athlete_applications")
			.select(columnId, { count: "exact" })
			.eq("is_deleted", false);

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
						case "athlete_id":
						case "university_id":
						case "program_id":
						case "stage":
							if (operator === "is") {
								query = query.eq(filterColumnId, values[0]);
							} else if (operator === "is not") {
								query = query.not(filterColumnId, "eq", values[0]);
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

						case "start_date":
						case "offer_date":
						case "commitment_date":
						case "last_interaction_at": {
							const normalizedQueryValues = values.map(normalizeDateValue);
							if (operator === "is") {
								query = query.eq(filterColumnId, normalizedQueryValues[0]);
							} else if (operator === "is not") {
								query = query.not(filterColumnId, "eq", normalizedQueryValues[0]);
							} else if (operator === "is after") {
								query = query.gt(filterColumnId, normalizedQueryValues[0]);
							} else if (operator === "is before") {
								query = query.lt(filterColumnId, normalizedQueryValues[0]);
							} else if (operator === "is on or after") {
								query = query.gte(filterColumnId, normalizedQueryValues[0]);
							} else if (operator === "is on or before") {
								query = query.lte(filterColumnId, normalizedQueryValues[0]);
							} else if (operator === "is between") {
								if (normalizedQueryValues.length >= 2) {
									query = query
										.gte(filterColumnId, normalizedQueryValues[0])
										.lte(filterColumnId, normalizedQueryValues[1]);
								}
							} else if (operator === "is not between") {
								if (normalizedQueryValues.length >= 2) {
									query = query.or(
										`${filterColumnId}.lt.${normalizedQueryValues[0]},${filterColumnId}.gt.${normalizedQueryValues[1]}`,
									);
								}
							}
							break;
						}
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
		console.error("Unexpected error in getApplicationsFaceted:", error);
		return new Map<string, number>();
	}
}

// Get athletes for filter options
export async function getAthletes() {
	try {
		const supabase = await createClient();

		const { data: athletes, error } = await (supabase as any)
			.from("athletes")
			.select("id, full_name, graduation_year")
			.eq("is_deleted", false)
			.order("full_name");

		if (error) {
			console.error("Error fetching athletes:", error);
			return [];
		}

		return athletes || [];
	} catch (error) {
		console.error("Unexpected error in getAthletes:", error);
		return [];
	}
}

// Get universities for filter options
export async function getUniversities() {
	try {
		const supabase = await createClient();

		const { data: universities, error } = await (supabase as any)
			.from("universities")
			.select("id, name, state")
			.eq("is_deleted", false)
			.order("name");

		if (error) {
			console.error("Error fetching universities:", error);
			return [];
		}

		return universities || [];
	} catch (error) {
		console.error("Unexpected error in getUniversities:", error);
		return [];
	}
}

// Get programs for filter options
export async function getPrograms() {
	try {
		const supabase = await createClient();

		const { data: programs, error } = await (supabase as any)
			.from("programs")
			.select(`
				id,
				gender,
				team_url,
				university:universities (
					id,
					name
				)
			`)
			.eq("is_deleted", false)
			.order("gender");

		if (error) {
			console.error("Error fetching programs:", error);
			return [];
		}

		return programs || [];
	} catch (error) {
		console.error("Unexpected error in getPrograms:", error);
		return [];
	}
}

// Server-side prefetch for combined applications+faceted data
export async function prefetchApplicationsWithFacetedServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = [
		"athlete_id",
		"university_id",
		"program_id",
		"stage",
	],
) {
	return await getApplicationsWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}
