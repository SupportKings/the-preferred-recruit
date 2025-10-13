"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/queries/getUser";

export async function createCampaignLead(data: {
	athlete_id: string;
	campaign_id: string;
	university_id: string;
	program_id?: string;
	coach_id?: string;
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
			status: data.status,
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
