"use server";

import { revalidatePath } from "next/cache";

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

	// Soft delete by setting is_deleted flag and get the lead data for revalidation
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

	// Revalidate paths
	revalidatePath("/dashboard/campaigns");
	if (deletedLead.campaign_id) {
		revalidatePath(`/dashboard/campaigns/${deletedLead.campaign_id}`);
	}
	if (deletedLead.application_id) {
		revalidatePath(`/dashboard/athlete-applications/${deletedLead.application_id}`);
	}
	if (deletedLead.university_id) {
		revalidatePath(`/dashboard/universities/${deletedLead.university_id}`);
	}

	return { success: true };
}

export async function createCampaignLead(applicationId: string, leadData: any) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("campaign_leads")
		.insert({
			application_id: applicationId,
			...leadData,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create campaign lead: ${error.message}`);
	}

	return { success: true, data };
}

export async function updateCampaignLead(leadId: string, leadData: any) {
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
