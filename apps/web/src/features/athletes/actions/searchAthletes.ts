"use server";

import { createClient } from "@/utils/supabase/server";

interface SearchAthletesParams {
	searchTerm?: string;
	page?: number;
	pageSize?: number;
}

interface Athlete {
	id: string;
	full_name: string;
	contact_email: string | null;
	graduation_year: number | null;
	high_school: string | null;
	state: string | null;
}

export async function searchAthletes({
	searchTerm = "",
	page = 0,
	pageSize = 50,
}: SearchAthletesParams): Promise<{
	athletes: Athlete[];
	hasMore: boolean;
}> {
	const supabase = await createClient();

	let query = supabase
		.from("athletes")
		.select(
			"id, full_name, contact_email, graduation_year, high_school, state",
			{
				count: "exact",
			},
		)
		.eq("is_deleted", false);

	// Apply search filter if provided
	if (searchTerm && searchTerm.trim().length > 0) {
		query = query.or(
			`full_name.ilike.%${searchTerm}%,contact_email.ilike.%${searchTerm}%,high_school.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`,
		);
	}

	// Order by full name
	query = query.order("full_name", { ascending: true });

	// Apply pagination
	const from = page * pageSize;
	const to = from + pageSize - 1;
	query = query.range(from, to);

	const { data, error, count } = await query;

	if (error) {
		console.error("Error searching athletes:", error);
		throw new Error("Failed to search athletes");
	}

	const hasMore =
		count !== null && count !== undefined
			? from + (data?.length || 0) < count
			: false;

	return {
		athletes: (data as Athlete[]) || [],
		hasMore,
	};
}
