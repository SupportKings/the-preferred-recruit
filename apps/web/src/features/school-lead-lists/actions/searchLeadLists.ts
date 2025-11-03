"use server";

import { createClient } from "@/utils/supabase/server";

interface SearchLeadListsParams {
	searchTerm?: string;
	page?: number;
	pageSize?: number;
}

interface LeadList {
	id: string;
	name: string;
	type: string | null;
	priority: string | null;
	season_label: string | null;
	athlete: {
		id: string;
		full_name: string;
		contact_email: string | null;
		graduation_year: number | null;
	} | null;
}

export async function searchLeadLists({
	searchTerm = "",
	page = 0,
	pageSize = 50,
}: SearchLeadListsParams): Promise<{
	leadLists: LeadList[];
	hasMore: boolean;
}> {
	const supabase = await createClient();

	// For search with nested fields (athlete name), we need to fetch more records
	// and do client-side filtering, then paginate
	let query = supabase
		.from("school_lead_lists")
		.select(
			`
			id,
			name,
			type,
			priority,
			season_label,
			athlete:athletes!school_lead_lists_athlete_id_fkey(
				id,
				full_name,
				contact_email,
				graduation_year
			)
		`,
			{ count: "exact" },
		)
		.eq("is_deleted", false);

	// Apply search filter only on direct fields (not nested relations)
	if (searchTerm && searchTerm.trim().length > 0) {
		query = query.or(
			`name.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%,priority.ilike.%${searchTerm}%,season_label.ilike.%${searchTerm}%`,
		);
	}

	// Order by name
	query = query.order("name", { ascending: true });

	// When searching, fetch more records to allow proper client-side filtering
	// Otherwise use standard pagination
	if (searchTerm && searchTerm.trim().length > 0) {
		// Fetch up to 500 records for search
		query = query.limit(500);
	} else {
		// Use server-side pagination when not searching
		const from = page * pageSize;
		const to = from + pageSize - 1;
		query = query.range(from, to);
	}

	const { data, error, count } = await query;

	if (error) {
		console.error("Error searching lead lists:", error);
		throw new Error("Failed to search lead lists");
	}

	// Transform Supabase response to match LeadList type
	// Supabase returns nested relations as arrays, we need single objects or null
	let filteredData: LeadList[] =
		data?.map((list) => ({
			id: list.id,
			name: list.name,
			type: list.type,
			priority: list.priority,
			season_label: list.season_label,
			athlete: Array.isArray(list.athlete)
				? list.athlete[0] || null
				: list.athlete || null,
		})) || [];

	// Client-side filtering for nested fields if search term exists
	if (searchTerm && searchTerm.trim().length > 0) {
		const searchLower = searchTerm.toLowerCase();
		filteredData = filteredData.filter((list) => {
			return (
				list.name?.toLowerCase().includes(searchLower) ||
				list.type?.toLowerCase().includes(searchLower) ||
				list.priority?.toLowerCase().includes(searchLower) ||
				list.season_label?.toLowerCase().includes(searchLower) ||
				list.athlete?.full_name?.toLowerCase().includes(searchLower) ||
				list.athlete?.contact_email?.toLowerCase().includes(searchLower)
			);
		});

		// Apply pagination after filtering
		const from = page * pageSize;
		const to = from + pageSize;
		const paginatedData = filteredData.slice(from, to);
		const hasMore = to < filteredData.length;

		return {
			leadLists: paginatedData,
			hasMore,
		};
	}

	// For non-search queries, use count from database
	const hasMore =
		count !== null && count !== undefined
			? page * pageSize + filteredData.length < count
			: false;

	return {
		leadLists: filteredData,
		hasMore,
	};
}
