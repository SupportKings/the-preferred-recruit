"use server";

import { createClient } from "@/utils/supabase/server";

export async function getTeamMembers() {
	try {
		const supabase = await createClient();

		const { data: teamMembers, error } = await (supabase as any)
			.from("team_members")
			.select("id, first_name, last_name, job_title, email")
			.eq("is_active", true)
			.is("is_deleted", false)
			.order("first_name");

		if (error) {
			console.error("Error fetching team members:", error);
			return [];
		}

		return teamMembers || [];
	} catch (error) {
		console.error("Unexpected error in getTeamMembers:", error);
		return [];
	}
}
