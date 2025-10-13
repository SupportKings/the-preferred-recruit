"use server";

import { createClient } from "@/utils/supabase/server";

export async function getSchoolLeadList(id: string) {
	try {
		const supabase = await createClient();

		const { data: leadList, error } = await (supabase as any)
			.from("school_lead_lists")
			.select(
				`
				*,
				athlete:athletes!school_lead_lists_athlete_id_fkey(
					id,
					full_name,
					contact_email,
					graduation_year
				),
				school_lead_list_entries(
					id,
					school_lead_list_id,
					university_id,
					program_id,
					status,
					added_at,
					internal_notes,
					university:universities(
						id,
						name,
						city,
						region
					),
					program:programs(
						id,
						gender,
						team_url
					)
				),
				campaigns_primary_lead_list:campaigns!campaigns_primary_lead_list_id_fkey(
					id,
					athlete_id,
					name,
					type,
					status,
					start_date,
					end_date,
					daily_send_cap,
					sending_tool_campaign_url,
					internal_notes
				),
				campaign_leads(
					id,
					campaign_id,
					university_id,
					program_id,
					university_job_id,
					status,
					first_reply_at,
					include_reason,
					internal_notes,
					campaign:campaigns(
						id,
						name,
						type,
						status
					),
					university:universities(
						id,
						name,
						city
					),
					program:programs(
						id,
						gender,
						team_url
					),
					university_job:university_jobs(
						id,
						job_title,
						work_email,
						program_scope
					)
				),
				athlete_applications(
					id,
					athlete_id,
					university_id,
					program_id,
					stage,
					start_date,
					offer_date,
					commitment_date,
					scholarship_amount_per_year,
					scholarship_percent,
					internal_notes,
					athlete:athletes(
						id,
						full_name,
						contact_email
					),
					university:universities(
						id,
						name,
						city
					),
					program:programs(
						id,
						gender,
						team_url
					)
				)
			`,
			)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching school lead list:", error);
			throw new Error("Failed to fetch school lead list");
		}

		return leadList;
	} catch (error) {
		console.error("Error in getSchoolLeadList:", error);
		throw error;
	}
}
