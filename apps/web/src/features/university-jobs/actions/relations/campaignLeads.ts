"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

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
