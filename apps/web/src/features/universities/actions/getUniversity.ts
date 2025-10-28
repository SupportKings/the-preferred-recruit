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
				university_conferences!left (
					id,
					conference_id,
					start_date,
					end_date,
					conferences (
						id,
						name
					)
				),
				university_divisions!left (
					id,
					division_id,
					start_date,
					end_date,
					divisions (
						id,
						name
					)
				),
				programs (
					id,
					gender,
					team_url,
					team_instagram,
					team_twitter,
					internal_notes,
					is_deleted
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
			.eq("university_jobs.is_deleted", false)
			.eq("athlete_applications.is_deleted", false)
			.eq("school_lead_list_entries.is_deleted", false)
			.eq("campaign_leads.is_deleted", false)
			.eq("campaign_leads.university_jobs.is_deleted", false)
			.eq("ball_knowledge.is_deleted", false)
			.single();

		if (error) {
			console.error("Error fetching university:", error);
			return null;
		}

		// Filter out soft-deleted programs
		if (university?.programs) {
			university.programs = university.programs.filter(
				(program: { is_deleted: boolean }) => !program.is_deleted,
			);
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
			.eq("is_deleted", false)
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

		// Separate conference and division filters from other filters
		const conferenceFilter = filters.find(
			(f) => f.columnId === "current_conference",
		);
		const divisionFilter = filters.find(
			(f) => f.columnId === "current_division",
		);
		const otherFilters = filters.filter(
			(f) =>
				f.columnId !== "current_conference" &&
				f.columnId !== "current_division",
		);

		let query: any = supabase
			.from("universities")
			.select(
				`
				*,
				university_conferences!left (
					conference_id,
					end_date,
					conferences (
						id,
						name
					)
				),
				university_divisions!left (
					division_id,
					end_date,
					divisions (
						id,
						name
					)
				)
			`,
				{ count: "exact" },
			)
			.eq("is_deleted", false);

		// Apply regular filters (not conference/division)
		otherFilters.forEach((filter) => {
			if (filter.values && filter.values.length > 0) {
				const values = filter.values;
				const operator = filter.operator || "is";
				const columnId = filter.columnId;

				// Apply filter based on column type and operator
				switch (columnId) {
					case "name":
					case "city":
						// Text fields - support contains/does not contain
						if (operator === "contains") {
							query = query.ilike(columnId, `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not(columnId, "ilike", `%${values[0]}%`);
						}
						break;

					case "state":
					case "type_public_private":
						// Text/Option fields - support both text search and exact match
						if (operator === "contains") {
							query = query.ilike(columnId, `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not(columnId, "ilike", `%${values[0]}%`);
						} else if (operator === "is" || operator === "is any of") {
							// "is" for single value, "is any of" for multiple values
							// Both use IN logic (OR)
							if (values.length === 1) {
								query = query.eq(columnId, values[0]);
							} else {
								query = query.in(columnId, values);
							}
						} else if (operator === "is not" || operator === "is none of") {
							// "is not" for single value, "is none of" for multiple values
							// Both use NOT IN logic (AND NOT)
							if (values.length === 1) {
								query = query.neq(columnId, values[0]);
							} else {
								query = query.not(columnId, "in", values);
							}
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
						// Boolean field - support is/is not/is any of/is none of
						if (operator === "is" || operator === "is any of") {
							if (values.length === 1) {
								query = query.eq(columnId, values[0] === "true");
							} else {
								// Multiple values for boolean (both true and false selected = all records)
								// Convert string values to booleans
								const boolValues = values.map((v: string) => v === "true");
								query = query.in(columnId, boolValues);
							}
						} else if (operator === "is not" || operator === "is none of") {
							if (values.length === 1) {
								query = query.not(columnId, "eq", values[0] === "true");
							} else {
								const boolValues = values.map((v: string) => v === "true");
								query = query.not(columnId, "in", boolValues);
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
			query = query.order("name", { ascending: true });
		}

		// If conference or division filters exist, we need to fetch all data first
		// because we can't filter on nested fields in Supabase
		let data: any[] = [];
		let totalCount = 0;

		if (conferenceFilter || divisionFilter) {
			// Fetch ALL matching universities (without pagination)
			const { data: allData, error } = await query;

			if (error) {
				console.error("Error fetching universities with filters:", error);
				return { data: [], count: 0 };
			}

			// Process and filter by conference/division in JavaScript
			let filtered =
				allData?.map((university: any) => {
					const currentConference = university.university_conferences?.find(
						(uc: any) => uc.end_date === null,
					);
					const currentDivision = university.university_divisions?.find(
						(ud: any) => ud.end_date === null,
					);

					return {
						...university,
						current_conference: currentConference?.conferences?.name || null,
						current_division: currentDivision?.divisions?.name || null,
					};
				}) || [];

			// Apply conference filter
			if (
				conferenceFilter &&
				conferenceFilter.values &&
				conferenceFilter.values.length > 0
			) {
				const operator = conferenceFilter.operator || "is";
				const values = conferenceFilter.values;

				if (
					operator === "is" ||
					operator === "is any of" ||
					operator === "contains"
				) {
					filtered = filtered.filter((uni: any) =>
						values.includes(uni.current_conference),
					);
				} else if (
					operator === "is not" ||
					operator === "is none of" ||
					operator === "does not contain"
				) {
					filtered = filtered.filter(
						(uni: any) => !values.includes(uni.current_conference),
					);
				}
			}

			// Apply division filter
			if (
				divisionFilter &&
				divisionFilter.values &&
				divisionFilter.values.length > 0
			) {
				const operator = divisionFilter.operator || "is";
				const values = divisionFilter.values;

				if (
					operator === "is" ||
					operator === "is any of" ||
					operator === "contains"
				) {
					filtered = filtered.filter((uni: any) =>
						values.includes(uni.current_division),
					);
				} else if (
					operator === "is not" ||
					operator === "is none of" ||
					operator === "does not contain"
				) {
					filtered = filtered.filter(
						(uni: any) => !values.includes(uni.current_division),
					);
				}
			}

			// Apply pagination to filtered results
			totalCount = filtered.length;
			const from = page * pageSize;
			const to = from + pageSize;
			data = filtered.slice(from, to);
		} else {
			// No conference/division filters - use database pagination
			const from = page * pageSize;
			const to = from + pageSize - 1;
			query = query.range(from, to);

			const { data: dbData, error, count } = await query;

			if (error) {
				console.error("Error fetching universities with filters:", error);
				return { data: [], count: 0 };
			}

			// Process data to extract current conferences and divisions
			data =
				dbData?.map((university: any) => {
					const currentConference = university.university_conferences?.find(
						(uc: any) => uc.end_date === null,
					);
					const currentDivision = university.university_divisions?.find(
						(ud: any) => ud.end_date === null,
					);

					return {
						...university,
						current_conference: currentConference?.conferences?.name || null,
						current_division: currentDivision?.divisions?.name || null,
					};
				}) || [];

			totalCount = count || 0;
		}

		return { data, count: totalCount };
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
				// Handle computed fields (conference/division) differently
				if (
					columnId === "current_conference" ||
					columnId === "current_division"
				) {
					// For computed fields, we need to fetch all universities and compute values
					let facetQuery: any = supabase
						.from("universities")
						.select(
							`
							*,
							university_conferences!left (
								conference_id,
								end_date,
								conferences (
									id,
									name
								)
							),
							university_divisions!left (
								division_id,
								end_date,
								divisions (
									id,
									name
								)
							)
						`,
						)
						.eq("is_deleted", false);

					// Apply non-computed filters
					filters
						.filter(
							(filter) =>
								filter.columnId !== columnId &&
								filter.columnId !== "current_conference" &&
								filter.columnId !== "current_division",
						)
						.forEach((filter) => {
							if (filter.values && filter.values.length > 0) {
								const values = filter.values;
								const operator = filter.operator || "is";
								const filterColumnId = filter.columnId;

								// Apply same operator logic as main query (only non-computed fields)
								switch (filterColumnId) {
									case "name":
									case "city":
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
										} else if (operator === "is" || operator === "is any of") {
											if (values.length === 1) {
												facetQuery = facetQuery.eq(filterColumnId, values[0]);
											} else {
												facetQuery = facetQuery.in(filterColumnId, values);
											}
										} else if (
											operator === "is not" ||
											operator === "is none of"
										) {
											if (values.length === 1) {
												facetQuery = facetQuery.not(
													filterColumnId,
													"eq",
													values[0],
												);
											} else {
												facetQuery = facetQuery.not(
													filterColumnId,
													"in",
													values,
												);
											}
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
										if (operator === "is" || operator === "is any of") {
											if (values.length === 1) {
												facetQuery = facetQuery.eq(
													filterColumnId,
													values[0] === "true",
												);
											} else {
												const boolValues = values.map(
													(v: string) => v === "true",
												);
												facetQuery = facetQuery.in(filterColumnId, boolValues);
											}
										} else if (
											operator === "is not" ||
											operator === "is none of"
										) {
											if (values.length === 1) {
												facetQuery = facetQuery.not(
													filterColumnId,
													"eq",
													values[0] === "true",
												);
											} else {
												const boolValues = values.map(
													(v: string) => v === "true",
												);
												facetQuery = facetQuery.not(
													filterColumnId,
													"in",
													boolValues,
												);
											}
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

					// Process data to add computed fields
					let processedFacetData =
						facetData?.map((university: any) => {
							const currentConference = university.university_conferences?.find(
								(uc: any) => uc.end_date === null,
							);
							const currentDivision = university.university_divisions?.find(
								(ud: any) => ud.end_date === null,
							);

							return {
								...university,
								current_conference:
									currentConference?.conferences?.name || null,
								current_division: currentDivision?.divisions?.name || null,
							};
						}) || [];

					// Apply client-side filtering for OTHER conference/division filters
					filters.forEach((filter) => {
						if (
							filter.columnId !== columnId &&
							(filter.columnId === "current_conference" ||
								filter.columnId === "current_division") &&
							filter.values &&
							filter.values.length > 0
						) {
							const operator = filter.operator || "is";
							const values = filter.values;
							const filterColumn = filter.columnId;

							if (
								operator === "is" ||
								operator === "is any of" ||
								operator === "contains"
							) {
								processedFacetData = processedFacetData.filter((uni: any) =>
									values.includes(uni[filterColumn]),
								);
							} else if (
								operator === "is not" ||
								operator === "is none of" ||
								operator === "does not contain"
							) {
								processedFacetData = processedFacetData.filter(
									(uni: any) => !values.includes(uni[filterColumn]),
								);
							}
						}
					});

					// Count the values
					const facetMap = new Map<string, number>();
					processedFacetData.forEach((university: any) => {
						const value = university[columnId];

						if (value !== null && value !== undefined) {
							const key = String(value);
							facetMap.set(key, (facetMap.get(key) || 0) + 1);
						}
					});

					facetedData[columnId] = facetMap;
					return;
				}

				// Regular column faceting
				let facetQuery: any = supabase
					.from("universities")
					.select(columnId, { count: "exact" })
					.eq("is_deleted", false);

				// Apply existing filters (excluding the column we're faceting and computed columns)
				filters
					.filter(
						(filter) =>
							filter.columnId !== columnId &&
							filter.columnId !== "current_conference" &&
							filter.columnId !== "current_division",
					)
					.forEach((filter) => {
						if (filter.values && filter.values.length > 0) {
							const values = filter.values;
							const operator = filter.operator || "is";
							const filterColumnId = filter.columnId;

							// Apply same operator logic as main query
							switch (filterColumnId) {
								case "name":
								case "city":
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
									} else if (operator === "is" || operator === "is any of") {
										if (values.length === 1) {
											facetQuery = facetQuery.eq(filterColumnId, values[0]);
										} else {
											facetQuery = facetQuery.in(filterColumnId, values);
										}
									} else if (
										operator === "is not" ||
										operator === "is none of"
									) {
										if (values.length === 1) {
											facetQuery = facetQuery.not(
												filterColumnId,
												"eq",
												values[0],
											);
										} else {
											facetQuery = facetQuery.not(filterColumnId, "in", values);
										}
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
									if (operator === "is" || operator === "is any of") {
										if (values.length === 1) {
											facetQuery = facetQuery.eq(
												filterColumnId,
												values[0] === "true",
											);
										} else {
											const boolValues = values.map(
												(v: string) => v === "true",
											);
											facetQuery = facetQuery.in(filterColumnId, boolValues);
										}
									} else if (
										operator === "is not" ||
										operator === "is none of"
									) {
										if (values.length === 1) {
											facetQuery = facetQuery.not(
												filterColumnId,
												"eq",
												values[0] === "true",
											);
										} else {
											const boolValues = values.map(
												(v: string) => v === "true",
											);
											facetQuery = facetQuery.not(
												filterColumnId,
												"in",
												boolValues,
											);
										}
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
