"use server";

import { createClient } from "@/utils/supabase/server";

interface SearchCampaignsParams {
	searchTerm?: string;
	page?: number;
	pageSize?: number;
	athleteId?: string;
}

interface Campaign {
	id: string;
	name: string;
	type: string | null;
	status: string | null;
	athlete_id: string;
	athletes?: {
		full_name: string | null;
		graduation_year: number | null;
	} | null;
}

interface CampaignFromDB {
	id: string;
	name: string;
	type: string | null;
	status: string | null;
	athlete_id: string;
	athletes:
		| {
				full_name: string | null;
				graduation_year: number | null;
		  }[]
		| null;
}

export async function searchCampaigns({
	searchTerm = "",
	page = 0,
	pageSize = 50,
	athleteId,
}: SearchCampaignsParams): Promise<{
	campaigns: Campaign[];
	hasMore: boolean;
}> {
	const supabase = await createClient();

	let query = supabase
		.from("campaigns")
		.select(
			"id, name, type, status, athlete_id, athletes(full_name, graduation_year)",
			{ count: "exact" },
		)
		.eq("is_deleted", false);

	// Filter by athlete if provided
	if (athleteId) {
		query = query.eq("athlete_id", athleteId);
	}

	// Apply search filter if provided (only search by name since type and status are enums)
	if (searchTerm && searchTerm.trim().length > 0) {
		query = query.ilike("name", `%${searchTerm}%`);
	}

	// Order by name
	query = query.order("name", { ascending: true });

	// Apply pagination
	const from = page * pageSize;
	const to = from + pageSize - 1;
	query = query.range(from, to);

	const { data, error, count } = await query;

	if (error) {
		console.error("Error searching campaigns:", error);
		throw new Error("Failed to search campaigns");
	}

	const hasMore =
		count !== null && count !== undefined
			? from + (data?.length || 0) < count
			: false;

	// Transform the data to match the Campaign interface
	const campaigns: Campaign[] =
		(data as CampaignFromDB[])?.map((campaign) => ({
			...campaign,
			athletes: campaign.athletes?.[0] || null,
		})) || [];

	return {
		campaigns,
		hasMore,
	};
}
