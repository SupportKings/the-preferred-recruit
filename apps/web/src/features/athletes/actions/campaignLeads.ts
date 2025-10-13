"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function createCampaignLead(data: {
	campaign_id: string;
	source_lead_list_id?: string;
	university_job_id?: string;
	include_reason?: string;
	status?: string;
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
			campaign_id: data.campaign_id,
			source_lead_list_id: data.source_lead_list_id,
			university_job_id: data.university_job_id,
			include_reason: data.include_reason,
			status: data.status || "pending",
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
		status?: string;
		first_reply_date?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data: lead, error } = await supabase
		.from("campaign_leads")
		.update({
			status: data.status,
			first_reply_date: data.first_reply_date,
			internal_notes: data.internal_notes,
		})
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
