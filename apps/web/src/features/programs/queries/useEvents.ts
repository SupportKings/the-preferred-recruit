"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/utils/supabase/client";

export function useEvents() {
	return useQuery({
		queryKey: ["events"],
		queryFn: async () => {
			const supabase = createClient();
			const { data, error } = await (supabase as any)
				.from("events")
				.select("*")
				.eq("is_deleted", false)
				.order("name", { ascending: true });

			if (error) {
				throw error;
			}

			return data || [];
		},
	});
}
