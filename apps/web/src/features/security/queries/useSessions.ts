"use client";

import { useQuery } from "@tanstack/react-query";
import { getSessions } from "./getSessions";

export const useSessions = () => {
	return useQuery({
		queryKey: ["sessions"],
		queryFn: getSessions,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: true,
	});
};
