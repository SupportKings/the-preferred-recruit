"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function createSendingToolLeadList(data: {
	campaign_id: string;
	format?: string;
	row_count?: number;
	file_url?: string;
	internal_notes?: string;
}) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data: list, error } = await supabase
		.from("sending_tool_lead_lists")
		.insert({
			campaign_id: data.campaign_id,
			format: data.format,
			row_count: data.row_count,
			file_url: data.file_url,
			internal_notes: data.internal_notes,
			generated_by: user.user.id,
			generated_at: new Date().toISOString(),
		})
		.select()
		.single();

	if (error) {
		throw new Error(
			`Failed to create sending tool lead list: ${error.message}`,
		);
	}

	return { success: true, data: list };
}

export async function updateSendingToolLeadList(
	listId: string,
	data: {
		format?: string;
		row_count?: number;
		file_url?: string;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data: list, error } = await supabase
		.from("sending_tool_lead_lists")
		.update({
			format: data.format,
			row_count: data.row_count,
			file_url: data.file_url,
			internal_notes: data.internal_notes,
		})
		.eq("id", listId)
		.select()
		.single();

	if (error) {
		throw new Error(
			`Failed to update sending tool lead list: ${error.message}`,
		);
	}

	return { success: true, data: list };
}

export async function deleteSendingToolLeadList(listId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("sending_tool_lead_lists")
		.delete()
		.eq("id", listId);

	if (error) {
		throw new Error(
			`Failed to delete sending tool lead list: ${error.message}`,
		);
	}

	return { success: true };
}

export async function getSendingToolLeadListsForAthlete(athleteId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	// First, get all campaign IDs for this athlete
	const { data: campaigns, error: campaignsError } = await supabase
		.from("campaigns")
		.select("id")
		.eq("athlete_id", athleteId);

	if (campaignsError) {
		console.error("Error fetching campaigns:", campaignsError);
		return [];
	}

	if (!campaigns || campaigns.length === 0) {
		return [];
	}

	const campaignIds = campaigns.map((c) => c.id);

	// Then fetch all sending tool lead lists for these campaigns
	const { data: lists, error: listsError } = await (supabase as any)
		.from("sending_tool_lead_lists")
		.select(
			`
			id,
			campaign_id,
			format,
			row_count,
			file_url,
			internal_notes,
			created_at,
			generated_by,
			generated_at,
			campaign:campaigns(id, name, type, status),
			generated_by_user:team_members!sending_tool_lead_lists_generated_by_fkey(id, first_name, last_name, email)
		`,
		)
		.in("campaign_id", campaignIds)
		.order("created_at", { ascending: false });

	if (listsError) {
		console.error("Error fetching sending tool lead lists:", listsError);
		return [];
	}

	return lists || [];
}
