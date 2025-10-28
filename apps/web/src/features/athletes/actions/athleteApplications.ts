"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";
import { revalidatePath } from "next/cache";

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

	// Soft delete: set is_deleted, deleted_at, and deleted_by
	const { error } = await supabase
		.from("athlete_applications")
		.update({
			is_deleted: true,
			deleted_at: new Date().toISOString(),
			deleted_by: null,
		})
		.eq("id", applicationId);

	if (error) {
		throw new Error(`Failed to delete athlete application: ${error.message}`);
	}

	// Revalidate the athlete detail page to refresh the list
	revalidatePath("/dashboard/athletes/[id]", "page");

	return { success: true };
}

export async function searchAthleteApplications(
	searchQuery?: string,
	athleteId?: string,
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	let query = (supabase as any)
		.from("athlete_applications")
		.select(
			`
			id,
			stage,
			university:universities(name),
			program:programs(gender),
			athlete:athletes(full_name, contact_email)
		`,
		)
		.eq("is_deleted", false)
		.order("created_at", { ascending: false })
		.limit(100); // Fetch more since we'll filter client-side

	// Filter by specific athlete if provided
	if (athleteId) {
		query = query.eq("athlete_id", athleteId);
	}

	const { data, error } = await query;

	if (error) {
		console.error("Error searching applications:", error);
		throw new Error(`Failed to search applications: ${error.message}`);
	}

	// Client-side filtering for search query (because Supabase doesn't support nested field filtering in or())
	let filteredData = data || [];

	if (searchQuery?.trim()) {
		const searchLower = searchQuery.toLowerCase().trim();
		filteredData = filteredData.filter((app: any) => {
			return (
				app.athlete?.full_name?.toLowerCase().includes(searchLower) ||
				app.athlete?.contact_email?.toLowerCase().includes(searchLower) ||
				app.university?.name?.toLowerCase().includes(searchLower) ||
				app.program?.gender?.toLowerCase().includes(searchLower) ||
				app.stage?.toLowerCase().includes(searchLower)
			);
		});
	}

	// Limit results after filtering
	const limitedData = filteredData.slice(0, 50);

	return { success: true, data: limitedData };
}
