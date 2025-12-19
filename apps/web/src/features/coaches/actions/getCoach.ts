"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCoach(id: string) {
	try {
		const supabase = await createClient();

		const { data: coach, error } = await supabase
			.from("coaches")
			.select(
				`
				*,
				university_jobs (
					id,
					job_title,
					program_scope,
					work_email,
					work_phone,
					start_date,
					end_date,
					internal_notes,
					university_id,
					program_id,
					universities (
						id,
						name,
						city,
						region
					),
					programs (
						id,
						gender
					)
				),
				campaign_leads (
					id,
					include_reason,
					included_at,
					status,
					first_reply_at,
					internal_notes,
					campaign_id,
					source_lead_list_id,
					university_id,
					program_id,
					university_job_id,
					application_id,
					campaigns (
						id,
						name,
						type,
						status
					),
					school_lead_lists (
						id,
						name,
						priority
					),
					universities (
						id,
						name,
						city,
						region
					),
					programs (
						id,
						gender
					),
					university_jobs (
						id,
						job_title,
						work_email
					),
					athlete_applications (
						id,
						stage,
						last_interaction_at
					)
				)
			`,
			)
			.eq("id", id)
			.eq("is_deleted", false)
			.eq("university_jobs.is_deleted", false)
			.eq("campaign_leads.is_deleted", false)
			.eq("campaign_leads.university_jobs.is_deleted", false)
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
			.select(
				`
				*,
				university_jobs (
					job_title,
					university_id,
					work_email,
					universities (
						name,
						state
					)
				)
			`,
			)
			.eq("is_deleted", false)
			.eq("university_jobs.is_deleted", false)
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

		// Check if any filters require university_jobs with inner join
		const hasUniversityJobsFilter = filters.some((filter) =>
			[
				"job_title",
				"university_name",
				"university_state",
				"work_email",
				"conference_name",
				"institution_flags",
				"us_news_ranking_national",
				"us_news_ranking_liberal_arts",
			].includes(filter.columnId),
		);

		// Check if filtering on universities table (nested)
		const hasUniversitiesFilter = filters.some((filter) =>
			[
				"university_name",
				"university_state",
				"institution_flags",
				"us_news_ranking_national",
				"us_news_ranking_liberal_arts",
			].includes(filter.columnId),
		);

		// Check if filtering on conference (requires deeper join)
		const hasConferenceFilter = filters.some(
			(filter) => filter.columnId === "conference_name",
		);

		// Use !inner when filtering on university_jobs to ensure filters work correctly
		const universityJobsJoin = hasUniversityJobsFilter
			? "university_jobs!inner"
			: "university_jobs";
		const universitiesJoin = hasUniversitiesFilter
			? "universities!inner"
			: "universities";
		const conferenceJoin = hasConferenceFilter
			? "university_conferences!inner"
			: "university_conferences";

		let query: any = supabase
			.from("coaches")
			.select(
				`
				*,
				${universityJobsJoin} (
					job_title,
					university_id,
					work_email,
					${universitiesJoin} (
						name,
						state,
						institution_flags_raw,
						us_news_ranking_national_2018,
						us_news_ranking_liberal_arts_2018,
						${conferenceJoin} (
							conferences (
								name
							)
						)
					)
				)
			`,
				{ count: "exact" },
			)
			.eq("is_deleted", false);

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
					case "phone":
						// Text fields - support contains/does not contain
						if (operator === "contains") {
							query = query.ilike(columnId, `%${values[0]}%`);
						} else if (operator === "does not contain") {
							query = query.not(columnId, "ilike", `%${values[0]}%`);
						}
						break;

					case "primary_specialty":
						// Enum field - support option operators
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

					case "job_title":
						// Filter by university_jobs.job_title
						if (operator === "contains") {
							query = query.ilike(
								"university_jobs.job_title",
								`%${values[0]}%`,
							);
						} else if (operator === "does not contain") {
							query = query.not(
								"university_jobs.job_title",
								"ilike",
								`%${values[0]}%`,
							);
						}
						break;

					case "university_name":
						// Filter by university_jobs.universities.name
						if (operator === "contains") {
							query = query.ilike(
								"university_jobs.universities.name",
								`%${values[0]}%`,
							);
						} else if (operator === "does not contain") {
							query = query.not(
								"university_jobs.universities.name",
								"ilike",
								`%${values[0]}%`,
							);
						}
						break;

					case "university_state":
						// Filter by university_jobs.universities.state
						if (operator === "contains") {
							query = query.ilike(
								"university_jobs.universities.state",
								`%${values[0]}%`,
							);
						} else if (operator === "does not contain") {
							query = query.not(
								"university_jobs.universities.state",
								"ilike",
								`%${values[0]}%`,
							);
						}
						break;

					case "work_email":
						// Filter by university_jobs.work_email
						if (operator === "contains") {
							query = query.ilike(
								"university_jobs.work_email",
								`%${values[0]}%`,
							);
						} else if (operator === "does not contain") {
							query = query.not(
								"university_jobs.work_email",
								"ilike",
								`%${values[0]}%`,
							);
						}
						break;

					case "conference_name":
						// Filter by conference name via university_conferences
						if (operator === "contains") {
							query = query.ilike(
								"university_jobs.universities.university_conferences.conferences.name",
								`%${values[0]}%`,
							);
						} else if (operator === "does not contain") {
							query = query.not(
								"university_jobs.universities.university_conferences.conferences.name",
								"ilike",
								`%${values[0]}%`,
							);
						}
						break;

					case "institution_flags":
						// Filter by HBCU/Community College/Women only
						if (operator === "contains") {
							query = query.ilike(
								"university_jobs.universities.institution_flags_raw",
								`%${values[0]}%`,
							);
						} else if (operator === "does not contain") {
							query = query.not(
								"university_jobs.universities.institution_flags_raw",
								"ilike",
								`%${values[0]}%`,
							);
						}
						break;

					case "us_news_ranking_national":
						// Filter by US News National ranking
						if (operator === "is less than") {
							query = query.lte(
								"university_jobs.universities.us_news_ranking_national_2018",
								Number(values[0]),
							);
						} else if (operator === "is greater than") {
							query = query.gte(
								"university_jobs.universities.us_news_ranking_national_2018",
								Number(values[0]),
							);
						} else if (operator === "is") {
							query = query.eq(
								"university_jobs.universities.us_news_ranking_national_2018",
								Number(values[0]),
							);
						}
						break;

					case "us_news_ranking_liberal_arts":
						// Filter by US News Liberal Arts ranking
						if (operator === "is less than") {
							query = query.lte(
								"university_jobs.universities.us_news_ranking_liberal_arts_2018",
								Number(values[0]),
							);
						} else if (operator === "is greater than") {
							query = query.gte(
								"university_jobs.universities.us_news_ranking_liberal_arts_2018",
								Number(values[0]),
							);
						} else if (operator === "is") {
							query = query.eq(
								"university_jobs.universities.us_news_ranking_liberal_arts_2018",
								Number(values[0]),
							);
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
				// Check if any filters require university_jobs
				const hasUniversityJobsFilter = filters.some((filter) =>
					[
						"job_title",
						"university_name",
						"university_state",
						"work_email",
					].includes(filter.columnId),
				);

				// Check if filtering on universities table (nested)
				const hasUniversitiesFilter = filters.some((filter) =>
					["university_name", "university_state"].includes(filter.columnId),
				);

				// Determine select query based on column type
				// Use !inner when filtering to ensure filters work correctly
				const universityJobsJoin = hasUniversityJobsFilter
					? "university_jobs!inner"
					: "university_jobs";
				const universitiesJoin = hasUniversitiesFilter
					? "universities!inner"
					: "universities";

				let selectString = columnId;
				if (columnId === "university_state") {
					selectString = `${universityJobsJoin}(${universitiesJoin}(state)),${universityJobsJoin}.${universitiesJoin}.state`;
				} else if (columnId === "job_title") {
					selectString = `${universityJobsJoin}(job_title)`;
				} else if (hasUniversityJobsFilter) {
					// If any filter needs university_jobs, include it in select
					selectString = `${columnId},${universityJobsJoin}(job_title,work_email,${universitiesJoin}(name,state))`;
				}

				let facetQuery: any = supabase
					.from("coaches")
					.select(selectString, { count: "exact" })
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
								case "full_name":
								case "email":
								case "instagram_profile":
								case "phone":
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

								case "job_title":
									if (operator === "contains") {
										facetQuery = facetQuery.ilike(
											"university_jobs.job_title",
											`%${values[0]}%`,
										);
									} else if (operator === "does not contain") {
										facetQuery = facetQuery.not(
											"university_jobs.job_title",
											"ilike",
											`%${values[0]}%`,
										);
									}
									break;

								case "university_name":
									if (operator === "contains") {
										facetQuery = facetQuery.ilike(
											"university_jobs.universities.name",
											`%${values[0]}%`,
										);
									} else if (operator === "does not contain") {
										facetQuery = facetQuery.not(
											"university_jobs.universities.name",
											"ilike",
											`%${values[0]}%`,
										);
									}
									break;

								case "university_state":
									if (operator === "contains") {
										facetQuery = facetQuery.ilike(
											"university_jobs.universities.state",
											`%${values[0]}%`,
										);
									} else if (operator === "does not contain") {
										facetQuery = facetQuery.not(
											"university_jobs.universities.state",
											"ilike",
											`%${values[0]}%`,
										);
									}
									break;

								case "work_email":
									if (operator === "contains") {
										facetQuery = facetQuery.ilike(
											"university_jobs.work_email",
											`%${values[0]}%`,
										);
									} else if (operator === "does not contain") {
										facetQuery = facetQuery.not(
											"university_jobs.work_email",
											"ilike",
											`%${values[0]}%`,
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
					let value;
					if (columnId === "university_state") {
						value = item?.university_jobs?.[0]?.universities?.state;
					} else if (columnId === "job_title") {
						value = item?.university_jobs?.[0]?.job_title;
					} else {
						value = item[columnId];
					}

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

		// Check if any filters require university_jobs
		const hasUniversityJobsFilter = filters.some((filter) =>
			[
				"job_title",
				"university_name",
				"university_state",
				"work_email",
			].includes(filter.columnId),
		);

		// Check if filtering on universities table (nested)
		const hasUniversitiesFilter = filters.some((filter) =>
			["university_name", "university_state"].includes(filter.columnId),
		);

		// Determine select query based on column type
		// Use !inner when filtering to ensure filters work correctly
		const universityJobsJoin = hasUniversityJobsFilter
			? "university_jobs!inner"
			: "university_jobs";
		const universitiesJoin = hasUniversitiesFilter
			? "universities!inner"
			: "universities";

		let selectString = columnId;
		if (columnId === "university_state") {
			selectString = `${universityJobsJoin}(${universitiesJoin}(state)),${universityJobsJoin}.${universitiesJoin}.state`;
		} else if (columnId === "job_title") {
			selectString = `${universityJobsJoin}(job_title)`;
		} else if (hasUniversityJobsFilter) {
			// If any filter needs university_jobs, include it in select
			selectString = `${columnId},${universityJobsJoin}(job_title,work_email,${universitiesJoin}(name,state))`;
		}

		let query: any = supabase
			.from("coaches")
			.select(selectString, { count: "exact" })
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
						case "full_name":
						case "email":
						case "instagram_profile":
						case "phone":
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

						case "job_title":
							if (operator === "contains") {
								query = query.ilike(
									"university_jobs.job_title",
									`%${values[0]}%`,
								);
							} else if (operator === "does not contain") {
								query = query.not(
									"university_jobs.job_title",
									"ilike",
									`%${values[0]}%`,
								);
							}
							break;

						case "university_name":
							if (operator === "contains") {
								query = query.ilike(
									"university_jobs.universities.name",
									`%${values[0]}%`,
								);
							} else if (operator === "does not contain") {
								query = query.not(
									"university_jobs.universities.name",
									"ilike",
									`%${values[0]}%`,
								);
							}
							break;

						case "university_state":
							if (operator === "contains") {
								query = query.ilike(
									"university_jobs.universities.state",
									`%${values[0]}%`,
								);
							} else if (operator === "does not contain") {
								query = query.not(
									"university_jobs.universities.state",
									"ilike",
									`%${values[0]}%`,
								);
							}
							break;

						case "work_email":
							if (operator === "contains") {
								query = query.ilike(
									"university_jobs.work_email",
									`%${values[0]}%`,
								);
							} else if (operator === "does not contain") {
								query = query.not(
									"university_jobs.work_email",
									"ilike",
									`%${values[0]}%`,
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
			let value;
			if (columnId === "university_state") {
				value = item?.university_jobs?.[0]?.universities?.state;
			} else if (columnId === "job_title") {
				value = item?.university_jobs?.[0]?.job_title;
			} else {
				value = item[columnId];
			}

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

// Search coaches by name with optional university filter
export async function searchCoaches(
	searchQuery: string,
	universityId?: string,
	limit = 20,
) {
	try {
		const supabase = await createClient();

		console.log(
			"[searchCoaches] Query:",
			searchQuery,
			"University:",
			universityId,
		);

		let query;

		// Filter by university if provided
		if (universityId) {
			// Need to join with university_jobs to filter by university
			query = supabase
				.from("coaches")
				.select(
					`
					id,
					full_name,
					email,
					university_jobs!inner(university_id)
				`,
				)
				.eq("is_deleted", false)
				.eq("university_jobs.university_id", universityId)
				.order("full_name");
		} else {
			query = supabase
				.from("coaches")
				.select("id, full_name, email")
				.eq("is_deleted", false)
				.order("full_name");
		}

		// Filter by search query (name or email)
		if (searchQuery && searchQuery.trim()) {
			const search = searchQuery.trim();
			query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
		}

		query = query.limit(limit);

		const { data, error } = await query;

		if (error) {
			console.error("[searchCoaches] Error:", error);
			return [];
		}

		console.log("[searchCoaches] Results:", data?.length || 0);

		// Clean up the response if university_jobs was included
		const coaches = data?.map((coach: any) => ({
			id: coach.id,
			full_name: coach.full_name,
			email: coach.email,
		}));

		return coaches || [];
	} catch (error) {
		console.error("[searchCoaches] Unexpected error:", error);
		return [];
	}
}
