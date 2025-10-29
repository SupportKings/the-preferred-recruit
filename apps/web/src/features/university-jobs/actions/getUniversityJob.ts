"use server";

import { createClient } from "@/utils/supabase/server";

import type { UniversityJobWithRelations } from "../types/university-job";

export async function getUniversityJob(
	id: string,
): Promise<UniversityJobWithRelations | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("university_jobs")
		.select(
			`
			*,
			coaches (
				id,
				full_name,
				email,
				primary_specialty
			),
			universities (
				id,
				name,
				city,
				state
			),
			programs (
				id,
				gender,
				team_url
			),
			coach_responsibilities (
				*,
				events (
					id,
					code,
					name,
					event_group
				)
			),
			campaign_leads (
				*,
				campaigns (
					id,
					name,
					type,
					status
				),
				universities (
					id,
					name,
					city
				),
				programs (
					id,
					gender
				)
			),
			replies (
				*,
				campaigns (
					id,
					name,
					type
				),
				athlete_applications (
					id,
					stage,
					last_interaction_at
				),
				athletes (
					id,
					full_name,
					contact_email
				)
			)
		`,
		)
		.eq("id", id)
		.eq("is_deleted", false)
		.single();

	if (error) {
		console.error("Error fetching university job:", error);
		return null;
	}

	return data as UniversityJobWithRelations;
}
