"use server";

import { createClient } from "@/utils/supabase/server";

export async function getClient(id: string) {
	try {
		const supabase = await createClient();

		// Fetch client with related data
		const { data: client, error } = await (supabase as any)
			.from("clients")
			.select(`
				*,
				billing_status (*),
				onboarding_status (*)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching client:", error);
			return null;
		}

		return client;
	} catch (error) {
		console.error("Unexpected error in getClient:", error);
		return null;
	}
}

export async function getAllClients() {
	try {
		const supabase = await createClient();

		const { data: clients, error } = await (supabase as any)
			.from("clients")
			.select(`
				*,
				billing_status (*),
				onboarding_status (*)
			`)
			.order("id", { ascending: false });

		if (error) {
			console.error("Error fetching clients:", error);
			return [];
		}

		return clients || [];
	} catch (error) {
		console.error("Unexpected error in getAllClients:", error);
		return [];
	}
}

export async function getClientsWithFilters(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = (supabase as any).from("clients").select(
			`
				*,
				billing_status (*),
				onboarding_status (*)
			`,
			{ count: "exact" },
		);

		// Apply filters with proper operator support
		filters.forEach((filter) => {
			if (filter.values && filter.values.length > 0) {
				const values = filter.values;
				const operator = filter.operator || "is";
				const columnId = filter.columnId;

				// Apply filter based on column type and operator
				switch (columnId) {
					case "client_name":
					case "first_name":
					case "last_name":
					case "email":
						// Text fields - support contains/does not contain
						if (operator === "contains") {
							query = query.ilike(columnId, `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not(columnId, "ilike", `%${values[0]}%`);
						}
						break;

					case "billing_status_id":
					case "onboarding_status_id":
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
			console.error("Error fetching clients with filters:", error);
			return { data: [], count: 0 };
		}

		return { data: data || [], count: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getClientsWithFilters:", error);
		return { data: [], count: 0 };
	}
}

// Combined query for clients with faceted data - optimized single call
export async function getClientsWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["billing_status_id", "onboarding_status_id"],
) {
	try {
		const supabase = await createClient();

		// Get main clients data
		const clientsResult = await getClientsWithFilters(
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
					.from("clients")
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
								case "client_name":
								case "first_name":
								case "last_name":
								case "email":
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

								case "billing_status_id":
								case "onboarding_status_id":
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
			clients: clientsResult.data,
			totalCount: clientsResult.count,
			facetedData,
		};
	} catch (error) {
		console.error("Unexpected error in getClientsWithFaceted:", error);
		return {
			clients: [],
			totalCount: 0,
			facetedData: {},
		};
	}
}

export async function getClientsFaceted(columnId: string, filters: any[] = []) {
	try {
		const supabase = await createClient();

		let query = (supabase as any)
			.from("clients")
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
						case "client_name":
						case "first_name":
						case "last_name":
						case "email":
							if (operator === "contains") {
								query = query.ilike(filterColumnId, `%${values[0]}%`);
							} else if (operator === "does not contain") {
								query = query.not(filterColumnId, "ilike", `%${values[0]}%`);
							}
							break;

						case "billing_status_id":
						case "onboarding_status_id":
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
		console.error("Unexpected error in getClientsFaceted:", error);
		return new Map<string, number>();
	}
}

// Server-side prefetch functions for page-level prefetching
export async function prefetchClientsTableDataServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return await getClientsWithFilters(filters, page, pageSize, sorting);
}

export async function prefetchClientsFacetedServer(
	columnId: string,
	filters: any[] = [],
) {
	return await getClientsFaceted(columnId, filters);
}

// Server-side prefetch for combined clients+faceted data
export async function prefetchClientsWithFacetedServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["billing_status_id", "onboarding_status_id"],
) {
	return await getClientsWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}

// Get billing statuses for filter options
export async function getBillingStatuses() {
	try {
		const supabase = await createClient();

		const { data: statuses, error } = await (supabase as any)
			.from("billing_status")
			.select("id, status_name")
			.order("status_name");

		if (error) {
			console.error("Error fetching billing statuses:", error);
			return [];
		}

		return statuses || [];
	} catch (error) {
		console.error("Unexpected error in getBillingStatuses:", error);
		return [];
	}
}

// Get onboarding statuses for filter options
export async function getOnboardingStatuses() {
	try {
		const supabase = await createClient();

		const { data: statuses, error } = await (supabase as any)
			.from("onboarding_status")
			.select("id, status_name")
			.order("status_name");

		if (error) {
			console.error("Error fetching onboarding statuses:", error);
			return [];
		}

		return statuses || [];
	} catch (error) {
		console.error("Unexpected error in getOnboardingStatuses:", error);
		return [];
	}
}
