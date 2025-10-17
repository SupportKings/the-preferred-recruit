"use server";

import { createClient } from "@/utils/supabase/server";

export async function getUniversity(id: string) {
	try {
		const supabase = await createClient();

		const { data: university, error } = await supabase
			.from("universities")
			.select(
				`
				*,
				programs (
					id,
					gender,
					team_url,
					team_instagram,
					team_twitter,
					internal_notes
				),
				university_jobs (
					id,
					job_title,
					work_email,
					work_phone,
					start_date,
					end_date,
					program_scope,
					internal_notes,
					coach_id,
					program_id,
					coaches (
						id,
						full_name,
						email,
						primary_specialty,
						linkedin_profile
					),
					programs (
						id,
						gender,
						team_url
					)
				),
				athlete_applications (
					id,
					start_date,
					offer_date,
					commitment_date,
					scholarship_amount_per_year,
					scholarship_percent,
					stage,
					internal_notes,
					athlete_id,
					program_id,
					athletes (
						id,
						full_name,
						contact_email,
						athlete_net_url,
						instagram_handle
					),
					programs (
						id,
						gender,
						team_url
					)
				),
				school_lead_list_entries (
					id,
					status,
					added_at,
					internal_notes,
					school_lead_list_id,
					program_id,
					school_lead_lists (
						id,
						name,
						priority
					),
					programs (
						id,
						gender,
						team_url
					)
				),
				campaign_leads (
					id,
					status,
					first_reply_at,
					internal_notes,
					campaign_id,
					program_id,
					university_job_id,
					campaigns (
						id,
						name,
						type,
						sending_tool_campaign_url
					),
					programs (
						id,
						gender,
						team_url
					),
					university_jobs (
						id,
						job_title,
						work_email,
						coaches (
							id,
							full_name,
							linkedin_profile
						)
					)
				),
				ball_knowledge (
					id,
					note,
					source_type,
					internal_notes,
					about_coach_id,
					about_program_id,
					from_athlete_id,
					coaches!ball_knowledge_about_coach_id_fkey (
						id,
						full_name,
						primary_specialty
					),
					programs (
						id,
						gender
					),
					athletes (
						id,
						full_name
					)
				)
			`,
			)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching university:", error);
			return null;
		}

		return university;
	} catch (error) {
		console.error("Unexpected error in getUniversity:", error);
		return null;
	}
}

export async function getAllUniversities() {
	try {
		const supabase = await createClient();

		const { data: universities, error } = await supabase
			.from("universities")
			.select("*")
			.order("name", { ascending: true });

		if (error) {
			console.error("Error fetching universities:", error);
			return [];
		}

		return universities || [];
	} catch (error) {
		console.error("Unexpected error in getAllUniversities:", error);
		return [];
	}
}

export async function getUniversitiesWithFilters(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query: any = supabase
			.from("universities")
			.select("*", { count: "exact" });

		// Apply filters with proper operator support
		filters.forEach((filter) => {
			if (filter.values && filter.values.length > 0) {
				const values = filter.values;
				const operator = filter.operator || "is";
				const columnId = filter.columnId;

				// Apply filter based on column type and operator
				switch (columnId) {
					case "name":
					case "city":
					case "state":
					case "type_public_private":
						// Text fields - support contains/does not contain
						if (operator === "contains") {
							query = query.ilike(columnId, `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not(columnId, "ilike", `%${values[0]}%`);
						}
						break;

					case "total_yearly_cost":
					case "undergraduate_enrollment":
						// Number fields - support numeric operators
						if (operator === "is") {
							query = query.eq(columnId, Number(values[0]));
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", Number(values[0]));
						} else if (operator === "greater than") {
							query = query.gt(columnId, Number(values[0]));
						} else if (operator === "less than") {
							query = query.lt(columnId, Number(values[0]));
						}
						break;

					case "email_blocked":
						// Boolean field - support is/is not
						if (operator === "is") {
							query = query.eq(columnId, values[0] === "true");
						} else if (operator === "is not") {
							query = query.not(columnId, "eq", values[0] === "true");
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
			query = query.order("name", { ascending: true });
		}

		// Apply pagination
		const from = page * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching universities with filters:", error);
			return { data: [], count: 0 };
		}

		return { data: data || [], count: count || 0 };
	} catch (error) {
		console.error("Unexpected error in getUniversitiesWithFilters:", error);
		return { data: [], count: 0 };
	}
}

// Combined query for universities with faceted data - optimized single call
export async function getUniversitiesWithFaceted(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["state", "type_public_private", "email_blocked"],
) {
	try {
		const supabase = await createClient();

		// Get main universities data
		const universitiesResult = await getUniversitiesWithFilters(
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
				let facetQuery: any = supabase
					.from("universities")
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
								case "name":
								case "city":
								case "state":
								case "type_public_private":
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

								case "total_yearly_cost":
								case "undergraduate_enrollment":
									if (operator === "is") {
										facetQuery = facetQuery.eq(
											filterColumnId,
											Number(values[0]),
										);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											Number(values[0]),
										);
									} else if (operator === "greater than") {
										facetQuery = facetQuery.gt(
											filterColumnId,
											Number(values[0]),
										);
									} else if (operator === "less than") {
										facetQuery = facetQuery.lt(
											filterColumnId,
											Number(values[0]),
										);
									}
									break;

								case "email_blocked":
									if (operator === "is") {
										facetQuery = facetQuery.eq(
											filterColumnId,
											values[0] === "true",
										);
									} else if (operator === "is not") {
										facetQuery = facetQuery.not(
											filterColumnId,
											"eq",
											values[0] === "true",
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
			universities: universitiesResult.data,
			totalCount: universitiesResult.count,
			facetedData,
		};
	} catch (error) {
		console.error("Unexpected error in getUniversitiesWithFaceted:", error);
		return {
			universities: [],
			totalCount: 0,
			facetedData: {},
		};
	}
}

export async function getUniversitiesFaceted(
	columnId: string,
	filters: any[] = [],
) {
	try {
		const supabase = await createClient();

		let query: any = supabase
			.from("universities")
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
						case "name":
						case "city":
						case "state":
						case "type_public_private":
							if (operator === "contains") {
								query = query.ilike(filterColumnId, `%${values[0]}%`);
							} else if (operator === "does not contain") {
								query = query.not(filterColumnId, "ilike", `%${values[0]}%`);
							}
							break;

						case "total_yearly_cost":
						case "undergraduate_enrollment":
							if (operator === "is") {
								query = query.eq(filterColumnId, Number(values[0]));
							} else if (operator === "is not") {
								query = query.not(filterColumnId, "eq", Number(values[0]));
							} else if (operator === "greater than") {
								query = query.gt(filterColumnId, Number(values[0]));
							} else if (operator === "less than") {
								query = query.lt(filterColumnId, Number(values[0]));
							}
							break;

						case "email_blocked":
							if (operator === "is") {
								query = query.eq(filterColumnId, values[0] === "true");
							} else if (operator === "is not") {
								query = query.not(filterColumnId, "eq", values[0] === "true");
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
		console.error("Unexpected error in getUniversitiesFaceted:", error);
		return new Map<string, number>();
	}
}

// Server-side prefetch functions for page-level prefetching
export async function prefetchUniversitiesTableDataServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
) {
	return await getUniversitiesWithFilters(filters, page, pageSize, sorting);
}

export async function prefetchUniversitiesFacetedServer(
	columnId: string,
	filters: any[] = [],
) {
	return await getUniversitiesFaceted(columnId, filters);
}

// Server-side prefetch for combined universities+faceted data
export async function prefetchUniversitiesWithFacetedServer(
	filters: any[] = [],
	page = 0,
	pageSize = 25,
	sorting: any[] = [],
	facetedColumns: string[] = ["state", "type_public_private", "email_blocked"],
) {
	return await getUniversitiesWithFaceted(
		filters,
		page,
		pageSize,
		sorting,
		facetedColumns,
	);
}
