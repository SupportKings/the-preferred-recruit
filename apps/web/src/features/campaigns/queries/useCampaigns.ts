"use client";

import { useQuery } from "@tanstack/react-query";
import { getCampaign } from "../actions/getCampaign";

// Query key factory
export const campaignQueries = {
	all: ["campaigns"] as const,
	lists: () => [...campaignQueries.all, "list"] as const,
	list: (filters: string) => [...campaignQueries.lists(), filters] as const,
	details: () => [...campaignQueries.all, "detail"] as const,
	detail: (id: string) => [...campaignQueries.details(), id] as const,
};

export function useCampaign(campaignId: string) {
	return useQuery({
		queryKey: campaignQueries.detail(campaignId),
		queryFn: () => getCampaign(campaignId),
		enabled: !!campaignId,
	});
}
