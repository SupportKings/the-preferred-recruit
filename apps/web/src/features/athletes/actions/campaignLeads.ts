"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function createCampaignLead(data: {
	application_id?: string;
	campaign_id: string;
	university_id?: string;
	program_id?: string;
	coach_id?: string;
	source_lead_list_id?: string;
	university_job_id?: string;
	include_reason?: string;
	status?: string;
	first_reply_date?: string;
	internal_notes?: string;
}) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data: lead, error } = await supabase
		.from("campaign_leads")
		.insert({
			application_id: data.application_id,
			campaign_id: data.campaign_id,
			university_id: data.university_id,
			program_id: data.program_id,
			coach_id: data.coach_id,
			source_lead_list_id: data.source_lead_list_id,
			university_job_id: data.university_job_id,
			include_reason: data.include_reason,
			status: data.status || "pending",
			first_reply_date: data.first_reply_date,
			internal_notes: data.internal_notes,
			included_at: new Date().toISOString(),
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create campaign lead: ${error.message}`);
	}

	return { success: true, data: lead };
}

export async function updateCampaignLead(
	leadId: string,
	data: {
		coach_id?: string | null;
		university_job_id?: string | null;
		source_lead_list_id?: string | null;
		include_reason?: string;
		status?: string;
		first_reply_date?: string;
		first_reply_at?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// Build update object with only provided fields
	const updateData: Record<string, string | null | undefined> = {};
	if (data.coach_id !== undefined) updateData.coach_id = data.coach_id;
	if (data.university_job_id !== undefined)
		updateData.university_job_id = data.university_job_id;
	if (data.source_lead_list_id !== undefined)
		updateData.source_lead_list_id = data.source_lead_list_id;
	if (data.include_reason !== undefined)
		updateData.include_reason = data.include_reason;
	if (data.status !== undefined) updateData.status = data.status;
	if (data.first_reply_date !== undefined)
		updateData.first_reply_date = data.first_reply_date;
	if (data.first_reply_at !== undefined)
		updateData.first_reply_at = data.first_reply_at;
	if (data.internal_notes !== undefined)
		updateData.internal_notes = data.internal_notes;

	const { data: lead, error } = await supabase
		.from("campaign_leads")
		.update(updateData)
		.eq("id", leadId)
		.select("*, campaigns(id), universities(id), athlete_applications(id)")
		.single();

	if (error) {
		throw new Error(`Failed to update campaign lead: ${error.message}`);
	}

	// Revalidate paths
	revalidatePath("/dashboard/campaigns");
	if (lead.campaign_id) {
		revalidatePath(`/dashboard/campaigns/${lead.campaign_id}`);
	}
	if (lead.application_id) {
		revalidatePath(`/dashboard/athlete-applications/${lead.application_id}`);
	}
	if (lead.university_id) {
		revalidatePath(`/dashboard/universities/${lead.university_id}`);
	}

	return { success: true, data: lead };
}

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
	// We don't need to fetch the lead first - just attempt the update
	// and get the lead data for revalidation in the same operation
	const { data: deletedLead, error } = await supabase
		.from("campaign_leads")
		.update({
			is_deleted: true,
			deleted_at: new Date().toISOString(),
			deleted_by: teamMember?.id || null,
		})
		.eq("id", leadId)
		.eq("is_deleted", false) // Only update if not already deleted
		.select("id, campaign_id, application_id, university_id")
		.maybeSingle();

	if (error) {
		throw new Error(`Failed to delete campaign lead: ${error.message}`);
	}

	if (!deletedLead) {
		throw new Error("Campaign lead not found or already deleted");
	}

	const lead = deletedLead;

	// Revalidate paths
	revalidatePath("/dashboard/campaigns");
	revalidatePath(`/dashboard/campaigns/${lead.campaign_id}`);
	if (lead.application_id) {
		revalidatePath(`/dashboard/athlete-applications/${lead.application_id}`);
	}
	if (lead.university_id) {
		revalidatePath(`/dashboard/universities/${lead.university_id}`);
	}

	return { success: true };
}
