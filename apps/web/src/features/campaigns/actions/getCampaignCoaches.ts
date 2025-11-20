"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import type {
	CampaignCoachData,
	CoachExportFilters,
} from "../types/coach-export-types";

export interface GetCoachesOptions {
	page?: number;
	pageSize?: number;
	filters?: CoachExportFilters;
	coachIds?: string[];
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

		// Build query to get all coaches with their university jobs
		// First get count for pagination
		let countQuery = supabase
			.from("university_jobs")
			.select("id", { count: "exact", head: true })
			.is("is_deleted", false)
			.not("coach_id", "is", null);

		// Apply filters to count query
		if (filters?.universities && filters.universities.length > 0) {
			countQuery = countQuery.in("university_id", filters.universities);
		}
		if (filters?.programs && filters.programs.length > 0) {
			countQuery = countQuery.in("program_id", filters.programs);
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

		// Apply filters
		if (filters?.universities && filters.universities.length > 0) {
			query = query.in("university_id", filters.universities);
		}

		if (filters?.programs && filters.programs.length > 0) {
			query = query.in("program_id", filters.programs);
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

				// Apply tuition filter if specified
				if (
					filters?.minTuition &&
					(!job.universities?.total_yearly_cost ||
						job.universities.total_yearly_cost < filters.minTuition)
				) {
					return null;
				}
				if (
					filters?.maxTuition &&
					(!job.universities?.total_yearly_cost ||
						job.universities.total_yearly_cost > filters.maxTuition)
				) {
					return null;
				}

				// Extract division from university_divisions
				const division =
					job.universities?.university_divisions?.[0]?.divisions?.name || null;

				// Apply division filter (client-side since it's nested)
				if (filters?.divisions && filters.divisions.length > 0) {
					if (!division || !filters.divisions.includes(division)) {
						return null;
					}
				}

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
					undergraduateEnrollment: job.universities?.undergraduate_enrollment || null,

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
