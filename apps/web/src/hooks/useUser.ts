"use client";

import { getUser } from "@/queries/getUser";

import { useQuery } from "@tanstack/react-query";

export function useUser() {
	const { data: session, isLoading: isPending } = useQuery({
		queryKey: ["user"],
		queryFn: getUser,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	return {
		user: session?.user,
		isPending,
		role: session?.user?.role as string | undefined,
	};
}
