"use client";

import { getSchoolLeadList } from "@/features/school-lead-lists/actions/getSchoolLeadList";

import { useQuery } from "@tanstack/react-query";

// Query keys
export const schoolLeadListQueries = {
	all: ["schoolLeadLists"] as const,
	lists: () => [...schoolLeadListQueries.all, "list"] as const,
	details: () => [...schoolLeadListQueries.all, "detail"] as const,
	detail: (id: string) => [...schoolLeadListQueries.details(), id] as const,
};

export function useSchoolLeadList(id: string) {
	return useQuery({
		queryKey: schoolLeadListQueries.detail(id),
		queryFn: () => getSchoolLeadList(id),
		enabled: !!id,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}
