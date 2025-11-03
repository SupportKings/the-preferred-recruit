"use server";

import { createClient } from "@/utils/supabase/server";

interface SearchUniversitiesParams {
	searchTerm?: string;
	page?: number;
	pageSize?: number;
}

interface University {
	id: string;
	name: string;
	city: string | null;
	state: string | null;
}

export async function searchUniversities({
	searchTerm = "",
	page = 0,
	pageSize = 50,
}: SearchUniversitiesParams): Promise<{
	universities: University[];
	hasMore: boolean;
}> {
	const supabase = await createClient();

	let query = supabase
		.from("universities")
		.select("id, name, city, state", { count: "exact" })
		.eq("is_deleted", false);

	// Apply search filter if provided
	if (searchTerm && searchTerm.trim().length > 0) {
		query = query.or(
			`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`,
		);
	}

	// Order by name
	query = query.order("name", { ascending: true });

	// Apply pagination
	const from = page * pageSize;
	const to = from + pageSize - 1;
	query = query.range(from, to);

	const { data, error, count } = await query;

	if (error) {
		console.error("Error searching universities:", error);
		throw new Error("Failed to search universities");
	}

	const hasMore =
		count !== null && count !== undefined
			? from + (data?.length || 0) < count
			: false;

	return {
		universities: (data as University[]) || [],
		hasMore,
	};
}
