"use server";

import { createClient } from "@/utils/supabase/server";

export async function getTeamMember(id: string) {
	try {
		const supabase = await createClient();

		// Fetch team member with related user data
		const { data: teamMember, error } = await (supabase as any)
			.from("team_members")
			.select(`
				*,
				user:user_id (
					id,
					email
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching team member:", error);
			return null;
		}

		return teamMember;
	} catch (error) {
		console.error("Unexpected error in getTeamMember:", error);
		return null;
	}
}

export async function getAllTeamMembers() {
	try {
		const supabase = await createClient();

		const { data: teamMembers, error } = await (supabase as any)
			.from("team_members")
			.select(`
				*,
				user:user_id (
					id,
					email
				)
			`)
			.order("id", { ascending: false });

		if (error) {
			console.error("Error fetching team members:", error);
			return [];
		}

		return teamMembers || [];
	} catch (error) {
		console.error("Unexpected error in getAllTeamMembers:", error);
		return [];
	}
}

export async function getTeamMembersWithFilters(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = (supabase as any).from("team_members").select(
			`
				*,
				user:user_id (
					id,
					email
				)
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
					case "first_name":
					case "last_name":
					case "job_title":
					case "timezone":
					case "email":
						// Text fields - support contains/does not contain
						if (operator === "contains") {
							query = query.ilike(columnId, `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not(columnId, "ilike", `%${values[0]}%`);
						}
						break;

					case "user_id":
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
			console.error("Error fetching team members with filters:", error);
			return { data: [], count: 0 };
		}

		return { data: data || [], count: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getTeamMembersWithFilters:", error);
		return { data: [], count: 0 };
	}
}

// Combined query for team members with faceted data - optimized single call
export async function getTeamMembersWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["user_id"],
) {
	try {
		const supabase = await createClient();

		// Get main team members data
		const teamMembersResult = await getTeamMembersWithFilters(
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
					.from("team_members")
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
								case "first_name":
								case "last_name":
								case "job_title":
								case "timezone":
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

								case "user_id":
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
			teamMembers: teamMembersResult.data,
			totalCount: teamMembersResult.count,
			facetedData,
		};
	} catch (error) {
		console.error("Unexpected error in getTeamMembersWithFaceted:", error);
		return {
			teamMembers: [],
			totalCount: 0,
			facetedData: {},
		};
	}
}

export async function getTeamMembersFaceted(
	columnId: string,
	filters: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query = (supabase as any)
			.from("team_members")
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
						case "first_name":
						case "last_name":
						case "job_title":
						case "timezone":
						case "email":
							if (operator === "contains") {
								query = query.ilike(filterColumnId, `%${values[0]}%`);
							} else if (operator === "does not contain") {
								query = query.not(filterColumnId, "ilike", `%${values[0]}%`);
							}
							break;

						case "user_id":
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
		console.error("Unexpected error in getTeamMembersFaceted:", error);
		return new Map<string, number>();
	}
}

// Server-side prefetch functions for page-level prefetching
export async function prefetchTeamMembersTableDataServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return await getTeamMembersWithFilters(filters, page, pageSize, sorting);
}

export async function prefetchTeamMembersFacetedServer(
	columnId: string,
	filters: any[] = [],
) {
	return await getTeamMembersFaceted(columnId, filters);
}

// Server-side prefetch for combined team members+faceted data
export async function prefetchTeamMembersWithFacetedServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["user_id"],
) {
	return await getTeamMembersWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}

// Get users for filter options
export async function getUsers() {
	try {
		const supabase = await createClient();

		const { data: users, error } = await (supabase as any)
			.from("user")
			.select("id, email")
			.order("email");

		if (error) {
			console.error("Error fetching users:", error);
			return [];
		}

		return users || [];
	} catch (error) {
		console.error("Unexpected error in getUsers:", error);
		return [];
	}
}
