"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function deleteCampaignLead(leadId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Get team member ID for the current user
	const { data: teamMember } = await supabase
		.from("team_members")
		.select("id")
		.eq("user_id", user.user.id)
		.maybeSingle();

	// Soft delete by setting is_deleted flag
	const { error } = await supabase
		.from("campaign_leads")
		.update({
			is_deleted: true,
			deleted_at: new Date().toISOString(),
			deleted_by: teamMember?.id || null,
		})
		.eq("id", leadId)
		.eq("is_deleted", false); // Only update if not already deleted

	if (error) {
		throw new Error(`Failed to delete campaign lead: ${error.message}`);
	}

	return { success: true };
}

export async function createCampaignLead(
	universityJobId: string,
	leadData: {
		campaign_id?: string | null;
		university_id?: string | null;
		program_id?: string | null;
		status?: string | null;
		include_reason?: string | null;
		internal_notes?: string | null;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("campaign_leads")
		.insert({
			university_job_id: universityJobId,
			...leadData,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create campaign lead: ${error.message}`);
	}

	return { success: true, data };
}

export async function updateCampaignLead(
	leadId: string,
	leadData: {
		status?: string | null;
		include_reason?: string | null;
		internal_notes?: string | null;
		program_id?: string | null;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("campaign_leads")
		.update(leadData)
		.eq("id", leadId);

	if (error) {
		throw new Error(`Failed to update campaign lead: ${error.message}`);
	}

	return { success: true };
}
