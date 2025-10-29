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
