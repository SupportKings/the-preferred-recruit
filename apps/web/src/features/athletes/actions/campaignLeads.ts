"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function createCampaignLead(data: {
	athlete_id?: string;
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
			athlete_id: data.athlete_id,
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
		university_job_id?: string;
		source_lead_list_id?: string;
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
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to update campaign lead: ${error.message}`);
	}

	return { success: true, data: lead };
}

export async function deleteCampaignLead(leadId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("campaign_leads")
		.delete()
		.eq("id", leadId);

	if (error) {
		throw new Error(`Failed to delete campaign lead: ${error.message}`);
	}

	return { success: true };
}
