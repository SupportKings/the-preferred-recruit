"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function createCampaign(
	athleteId: string,
	campaignData: {
		name: string;
		type?: string;
		primary_lead_list_id?: string;
		daily_send_cap?: number;
		start_date?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("campaigns")
		.insert({
			athlete_id: athleteId,
			name: campaignData.name,
			type: campaignData.type || "top",
			primary_lead_list_id: campaignData.primary_lead_list_id || null,
			daily_send_cap: campaignData.daily_send_cap || null,
			start_date: campaignData.start_date || null,
			status: "draft",
			internal_notes: campaignData.internal_notes || null,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create campaign: ${error.message}`);
	}

	return { success: true, data };
}

export async function updateCampaign(
	campaignId: string,
	campaignData: {
		name?: string;
		type?: string;
		status?: string;
		daily_send_cap?: number;
		start_date?: string;
		end_date?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("campaigns")
		.update(campaignData)
		.eq("id", campaignId);

	if (error) {
		throw new Error(`Failed to update campaign: ${error.message}`);
	}

	return { success: true };
}

export async function deleteCampaign(campaignId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("campaigns")
		.delete()
		.eq("id", campaignId);

	if (error) {
		throw new Error(`Failed to delete campaign: ${error.message}`);
	}

	return { success: true };
}
