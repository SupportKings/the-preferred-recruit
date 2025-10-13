"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function createAthleteApplication(
	athleteId: string,
	applicationData: {
		university_id: string;
		program_id: string;
		stage?: string;
		start_date?: string;
		origin_lead_list_id?: string;
		origin_campaign_id?: string;
		offer_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("athlete_applications")
		.insert({
			athlete_id: athleteId,
			university_id: applicationData.university_id,
			program_id: applicationData.program_id,
			stage: applicationData.stage || "intro",
			start_date: applicationData.start_date || null,
			origin_lead_list_id: applicationData.origin_lead_list_id || null,
			origin_campaign_id: applicationData.origin_campaign_id || null,
			offer_notes: applicationData.offer_notes || null,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create athlete application: ${error.message}`);
	}

	return { success: true, data };
}

export async function updateAthleteApplication(
	applicationId: string,
	applicationData: {
		university_id?: string;
		program_id?: string;
		stage?: string;
		start_date?: string;
		offer_date?: string;
		commitment_date?: string;
		origin_lead_list_id?: string;
		origin_campaign_id?: string;
		scholarship_amount_per_year?: number;
		scholarship_percent?: number;
		offer_notes?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("athlete_applications")
		.update(applicationData)
		.eq("id", applicationId);

	if (error) {
		throw new Error(`Failed to update athlete application: ${error.message}`);
	}

	return { success: true };
}

export async function deleteAthleteApplication(applicationId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("athlete_applications")
		.delete()
		.eq("id", applicationId);

	if (error) {
		throw new Error(`Failed to delete athlete application: ${error.message}`);
	}

	return { success: true };
}
