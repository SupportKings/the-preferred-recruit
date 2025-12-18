"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import type {
	CampaignCoachData,
	CoachExportServerFilters,
} from "../types/coach-export-types";

export interface GetCoachesOptions {
	page?: number;
	pageSize?: number;
	filters?: CoachExportServerFilters;
	coachIds?: string[];
}

// Helper to check if operator is negated (exclusion)
function isNegatedOperator(
	operator: string,
): operator is "is not" | "is none of" {
	return operator === "is not" || operator === "is none of";
}

export async function getCampaignCoachesAction(
	_campaignId: string,
	options?: GetCoachesOptions,
) {
	const { page = 1, pageSize = 50, filters, coachIds } = options || {};
	try {
		const session = await getUser();
		if (!session?.user) {
			return {
				success: false,
				error: "You must be logged in",
			};
		}

		const supabase = await createClient();

		// For tuition and division filtering, we need to use a different approach
		// since Supabase doesn't support filtering on joined table columns directly
		const hasTuitionFilter =
			filters?.tuition && filters.tuition.values.length > 0;
		const hasDivisionFilter =
			filters?.divisions && filters.divisions.values.length > 0;

		// If we have division filters, get matching university IDs first
		let divisionFilteredUniversityIds: string[] | null = null;
		if (hasDivisionFilter && filters?.divisions) {
			const divisionFilter = filters.divisions;

			// First get division IDs that match the filter
			const divisionQuery = supabase
				.from("divisions")
				.select("id")
				.in("name", divisionFilter.values);

			const { data: matchingDivisions, error: divError } = await divisionQuery;
			if (divError) {
				console.error("Error fetching divisions:", divError);
				return {
					success: false,
					error: divError.message,
				};
			}

			const divisionIds = matchingDivisions?.map((d) => d.id) || [];

			if (
				divisionIds.length === 0 &&
				!isNegatedOperator(divisionFilter.operator)
			) {
				// No matching divisions found and we want to include them
				return {
					success: true,
					data: [],
					pagination: {
						page,
						pageSize,
						totalCount: 0,
						totalPages: 0,
					},
				};
			}

			// Now get university IDs that have these divisions
			let uniDivQuery = supabase
				.from("university_divisions")
				.select("university_id");

			if (isNegatedOperator(divisionFilter.operator)) {
				// Exclude universities that have these divisions
				if (divisionIds.length > 0) {
					uniDivQuery = uniDivQuery.in("division_id", divisionIds);
				}
			} else {
				// Include only universities that have these divisions
				uniDivQuery = uniDivQuery.in("division_id", divisionIds);
			}

			const { data: uniDivs, error: uniDivError } = await uniDivQuery;
			if (uniDivError) {
				console.error("Error fetching university divisions:", uniDivError);
				return {
					success: false,
					error: uniDivError.message,
				};
			}

			const matchedUniIds = [
				...new Set(uniDivs?.map((ud) => ud.university_id) || []),
			];

			if (isNegatedOperator(divisionFilter.operator)) {
				// For negated operators, we need to exclude these universities
				// We'll handle this by getting all universities and excluding the matched ones
				divisionFilteredUniversityIds = matchedUniIds; // These are to be excluded
			} else {
				divisionFilteredUniversityIds = matchedUniIds; // These are to be included

				if (divisionFilteredUniversityIds.length === 0) {
					return {
						success: true,
						data: [],
						pagination: {
							page,
							pageSize,
							totalCount: 0,
							totalPages: 0,
						},
					};
				}
			}
		}

		// If we have tuition filters, get matching university IDs first
		let tuitionFilteredUniversityIds: string[] | null = null;
		if (hasTuitionFilter && filters?.tuition) {
			const tuitionFilter = filters.tuition;
			let universityQuery = supabase
				.from("universities")
				.select("id")
				.not("total_yearly_cost", "is", null);

			// Handle different number operators
			switch (tuitionFilter.operator) {
				case "is":
					universityQuery = universityQuery.eq(
						"total_yearly_cost",
						tuitionFilter.values[0],
					);
					break;
				case "is not":
					universityQuery = universityQuery.neq(
						"total_yearly_cost",
						tuitionFilter.values[0],
					);
					break;
				case "is between":
					if (tuitionFilter.values.length >= 2) {
						universityQuery = universityQuery
							.gte("total_yearly_cost", tuitionFilter.values[0])
							.lte("total_yearly_cost", tuitionFilter.values[1]);
					}
					break;
				case "is not between": {
					// Return universities outside the range (< min OR > max)
					// Use two separate queries and combine results
					if (tuitionFilter.values.length >= 2) {
						const min = tuitionFilter.values[0];
						const max = tuitionFilter.values[1];

						// Query for universities with tuition < min
						const { data: belowMin } = await supabase
							.from("universities")
							.select("id")
							.not("total_yearly_cost", "is", null)
							.lt("total_yearly_cost", min);

						// Query for universities with tuition > max
						const { data: aboveMax } = await supabase
							.from("universities")
							.select("id")
							.not("total_yearly_cost", "is", null)
							.gt("total_yearly_cost", max);

						// Combine and dedupe results
						const combinedIds = new Set([
							...(belowMin?.map((u) => u.id) || []),
							...(aboveMax?.map((u) => u.id) || []),
						]);

						tuitionFilteredUniversityIds = [...combinedIds];

						// Skip the normal query execution below
						if (tuitionFilteredUniversityIds.length === 0) {
							return {
								success: true,
								data: [],
								pagination: {
									page,
									pageSize,
									totalCount: 0,
									totalPages: 0,
								},
							};
						}
					}
					break;
				}
				case "is less than":
					universityQuery = universityQuery.lt(
						"total_yearly_cost",
						tuitionFilter.values[0],
					);
					break;
				case "is less than or equal to":
					universityQuery = universityQuery.lte(
						"total_yearly_cost",
						tuitionFilter.values[0],
					);
					break;
				case "is greater than":
					universityQuery = universityQuery.gt(
						"total_yearly_cost",
						tuitionFilter.values[0],
					);
					break;
				case "is greater than or equal to":
					universityQuery = universityQuery.gte(
						"total_yearly_cost",
						tuitionFilter.values[0],
					);
					break;
			}

			// Skip query execution if "is not between" already set tuitionFilteredUniversityIds
			if (tuitionFilteredUniversityIds === null) {
				// If user also selected specific universities, filter within those
				// Handle negated university operators
				if (filters?.universities && filters.universities.values.length > 0) {
					if (isNegatedOperator(filters.universities.operator)) {
						// Exclude these universities
						for (const uniId of filters.universities.values) {
							universityQuery = universityQuery.neq("id", uniId);
						}
					} else {
						// Include only these universities
						universityQuery = universityQuery.in(
							"id",
							filters.universities.values,
						);
					}
				}

				const { data: universities, error: uniError } = await universityQuery;
				if (uniError) {
					console.error(
						"Error fetching universities for tuition filter:",
						uniError,
					);
					return {
						success: false,
						error: uniError.message,
					};
				}

				tuitionFilteredUniversityIds = universities?.map((u) => u.id) || [];
			}

			// If no universities match the tuition filter, return empty results
			if (tuitionFilteredUniversityIds.length === 0) {
				return {
					success: true,
					data: [],
					pagination: {
						page,
						pageSize,
						totalCount: 0,
						totalPages: 0,
					},
				};
			}
		}

		// Combine all university filters into a single set
		// Priority: tuition > division > university selection
		let finalUniversityIds: string[] | null = null;
		let excludeUniversityIds: string[] | null = null;

		// Start with division filter if active (non-negated includes, negated excludes)
		if (divisionFilteredUniversityIds) {
			if (
				hasDivisionFilter &&
				filters?.divisions &&
				isNegatedOperator(filters.divisions.operator)
			) {
				excludeUniversityIds = divisionFilteredUniversityIds;
			} else {
				finalUniversityIds = divisionFilteredUniversityIds;
			}
		}

		// Apply tuition filter (intersect with existing)
		if (tuitionFilteredUniversityIds) {
			if (finalUniversityIds) {
				// Intersect tuition with division
				finalUniversityIds = finalUniversityIds.filter((id) =>
					tuitionFilteredUniversityIds.includes(id),
				);
			} else {
				finalUniversityIds = tuitionFilteredUniversityIds;
			}
		}

		// Apply university selection filter
		if (filters?.universities && filters.universities.values.length > 0) {
			const universityFilter = filters.universities;
			if (isNegatedOperator(universityFilter.operator)) {
				// Exclude these universities
				if (excludeUniversityIds) {
					excludeUniversityIds = [
						...excludeUniversityIds,
						...universityFilter.values,
					];
				} else {
					excludeUniversityIds = universityFilter.values;
				}
			} else {
				// Include only these universities (intersect with existing)
				if (finalUniversityIds) {
					finalUniversityIds = finalUniversityIds.filter((id) =>
						universityFilter.values.includes(id),
					);
				} else {
					finalUniversityIds = universityFilter.values;
				}
			}
		}

		// If finalUniversityIds is empty after all filtering, return empty results
		if (finalUniversityIds && finalUniversityIds.length === 0) {
			return {
				success: true,
				data: [],
				pagination: {
					page,
					pageSize,
					totalCount: 0,
					totalPages: 0,
				},
			};
		}

		// Build count query
		let countQuery = supabase
			.from("university_jobs")
			.select("id", { count: "exact", head: true })
			.is("is_deleted", false)
			.not("coach_id", "is", null);

		// Apply combined university filter to count query
		if (finalUniversityIds) {
			countQuery = countQuery.in("university_id", finalUniversityIds);
		}
		if (excludeUniversityIds) {
			for (const uniId of excludeUniversityIds) {
				countQuery = countQuery.neq("university_id", uniId);
			}
		}
		if (filters?.programs && filters.programs.values.length > 0) {
			if (isNegatedOperator(filters.programs.operator)) {
				// Exclude these programs
				for (const progId of filters.programs.values) {
					countQuery = countQuery.neq("program_id", progId);
				}
			} else {
				// Include only these programs
				countQuery = countQuery.in("program_id", filters.programs.values);
			}
		}

		const { count: totalCount, error: countError } = await countQuery;

		if (countError) {
			console.error("Error fetching count:", countError);
			return {
				success: false,
				error: countError.message,
			};
		}

		// Build main query with pagination
		let query = supabase
			.from("university_jobs")
			.select(`
				id,
				job_title,
				work_email,
				work_phone,
				start_date,
				end_date,
				coach_id,
				program_id,
				university_id,
				coaches:coach_id (
					id,
					full_name,
					email,
					phone,
					twitter_profile,
					instagram_profile,
					linkedin_profile
				),
				programs:program_id (
					id,
					gender,
					universities!programs_university_id_fkey (
						id,
						name
					)
				),
				universities:university_id (
					id,
					name,
					state,
					city,
					region,
					size_of_city,
					type_public_private,
					religious_affiliation,
					total_yearly_cost,
					average_gpa,
					sat_ebrw_25th,
					sat_ebrw_75th,
					sat_math_25th,
					sat_math_75th,
					act_composite_25th,
					act_composite_75th,
					acceptance_rate_pct,
					undergraduate_enrollment,
					university_divisions (
						divisions (
							name
						)
					),
					university_conferences (
						conferences (
							id,
							name
						)
					)
				)
			`)
			.is("is_deleted", false)
			.not("coach_id", "is", null)
			.order("id", { ascending: true })
			.range((page - 1) * pageSize, page * pageSize - 1);

		// Apply combined university filter to main query
		if (finalUniversityIds) {
			query = query.in("university_id", finalUniversityIds);
		}
		if (excludeUniversityIds) {
			for (const uniId of excludeUniversityIds) {
				query = query.neq("university_id", uniId);
			}
		}

		if (filters?.programs && filters.programs.values.length > 0) {
			if (isNegatedOperator(filters.programs.operator)) {
				// Exclude these programs
				for (const progId of filters.programs.values) {
					query = query.neq("program_id", progId);
				}
			} else {
				// Include only these programs
				query = query.in("program_id", filters.programs.values);
			}
		}

		const { data: universityJobs, error } = await query;

		if (error) {
			console.error("Error fetching coaches:", error);
			return {
				success: false,
				error: error.message,
			};
		}

		// Transform data to flat structure for export
		const allCoaches: CampaignCoachData[] = (universityJobs || [])
			.map((job: any): CampaignCoachData | null => {
				const coach = job.coaches;

				if (!coach) return null;

				// Filter by coach IDs if provided
				if (coachIds && coachIds.length > 0 && !coachIds.includes(coach.id)) {
					return null;
				}

				// Extract division from university_divisions
				const division =
					job.universities?.university_divisions?.[0]?.divisions?.name || null;

				// Extract conference from university_conferences
				const conference =
					job.universities?.university_conferences?.[0]?.conferences || null;

				// Program name is university name + gender
				const programName = job.programs?.universities?.name
					? `${job.programs.universities.name}`.trim()
					: null;

				return {
					// Coach info
					coachId: coach.id,
					coachName: coach.full_name || "",
					coachEmail: coach.email,
					coachPhone: coach.phone,
					coachTwitter: coach.twitter_profile,
					coachInstagram: coach.instagram_profile,
					coachLinkedIn: coach.linkedin_profile,

					// University Job info
					universityJobId: job.id || null,
					jobTitle: job.job_title || null,
					workEmail: job.work_email || null,
					workPhone: job.work_phone || null,
					startDate: job.start_date || null,
					endDate: job.end_date || null,

					// University info
					universityId: job.universities?.id || null,
					universityName: job.universities?.name || null,
					state: job.universities?.state || null,
					city: job.universities?.city || null,
					region: job.universities?.region || null,
					sizeOfCity: job.universities?.size_of_city || null,
					publicPrivate: job.universities?.type_public_private || null,
					religiousAffiliation: job.universities?.religious_affiliation || null,
					tuition: job.universities?.total_yearly_cost || null,
					conferenceId: conference?.id || null,
					conferenceName: conference?.name || null,

					// University academic info
					averageGpa: job.universities?.average_gpa || null,
					satReading25th: job.universities?.sat_ebrw_25th || null,
					satReading75th: job.universities?.sat_ebrw_75th || null,
					satMath25th: job.universities?.sat_math_25th || null,
					satMath75th: job.universities?.sat_math_75th || null,
					actComposite25th: job.universities?.act_composite_25th || null,
					actComposite75th: job.universities?.act_composite_75th || null,
					acceptanceRate: job.universities?.acceptance_rate_pct || null,
					undergraduateEnrollment:
						job.universities?.undergraduate_enrollment || null,

					// Program info
					programId: job.programs?.id || null,
					programName,
					division,
					gender: job.programs?.gender || null,

					// Campaign Lead info (not applicable for this use case)
					campaignLeadId: null,
					leadStatus: null,
					includeReason: null,
					includedAt: null,
				};
			})
			.filter((coach): coach is CampaignCoachData => coach !== null);

		// Calculate pagination info
		const total = totalCount || 0;
		const totalPages = Math.ceil(total / pageSize);

		return {
			success: true,
			data: allCoaches,
			pagination: {
				page,
				pageSize,
				totalCount: total,
				totalPages,
			},
		};
	} catch (error) {
		console.error("Unexpected error in getCampaignCoachesAction:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "An unexpected error occurred",
		};
	}
}
