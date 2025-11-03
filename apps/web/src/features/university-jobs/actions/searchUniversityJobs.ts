"use server";

import { createClient } from "@/utils/supabase/server";

interface SearchUniversityJobsParams {
	searchTerm?: string;
	universityId?: string;
	page?: number;
	pageSize?: number;
}

interface UniversityJob {
	id: string;
	job_title: string | null;
	work_email: string | null;
	coach: {
		id: string;
		full_name: string;
	} | null;
	university: {
		id: string;
		name: string;
		city: string | null;
		state: string | null;
	} | null;
	program: {
		id: string;
		gender: string | null;
	} | null;
}

export async function searchUniversityJobs({
	searchTerm = "",
	universityId,
	page = 0,
	pageSize = 50,
}: SearchUniversityJobsParams): Promise<{
	jobs: UniversityJob[];
	hasMore: boolean;
}> {
	const supabase = await createClient();

	// For search with nested fields, we need to fetch all matching records
	// and do client-side filtering, then paginate
	// For non-search or search on direct fields only, use server-side pagination

	let query = supabase
		.from("university_jobs")
		.select(
			`
			id,
			job_title,
			work_email,
			coach:coaches(id, full_name),
			university:universities(id, name, city, state),
			program:programs(id, gender)
		`,
			{ count: "exact" },
		)
		.eq("is_deleted", false);

	// Filter by university if provided
	if (universityId) {
		query = query.eq("university_id", universityId);
	}

	// Apply search filter only on direct fields (not nested relations)
	if (searchTerm && searchTerm.trim().length > 0) {
		query = query.or(
			`job_title.ilike.%${searchTerm}%,work_email.ilike.%${searchTerm}%`,
		);
	}

	// Order by created date
	query = query.order("created_at", { ascending: false });

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
		console.error("Error searching university jobs:", error);
		throw new Error("Failed to search university jobs");
	}

	// Transform Supabase response to match UniversityJob type
	// Supabase returns nested relations as arrays, we need single objects or null
	let filteredData: UniversityJob[] =
		data?.map((job) => ({
			id: job.id,
			job_title: job.job_title,
			work_email: job.work_email,
			coach: Array.isArray(job.coach)
				? job.coach[0] || null
				: job.coach || null,
			university: Array.isArray(job.university)
				? job.university[0] || null
				: job.university || null,
			program: Array.isArray(job.program)
				? job.program[0] || null
				: job.program || null,
		})) || [];

	// Client-side filtering for nested fields if search term exists
	if (searchTerm && searchTerm.trim().length > 0) {
		const searchLower = searchTerm.toLowerCase();
		filteredData = filteredData.filter((job) => {
			return (
				job.job_title?.toLowerCase().includes(searchLower) ||
				job.work_email?.toLowerCase().includes(searchLower) ||
				job.coach?.full_name?.toLowerCase().includes(searchLower) ||
				job.university?.name?.toLowerCase().includes(searchLower) ||
				job.university?.city?.toLowerCase().includes(searchLower) ||
				job.university?.state?.toLowerCase().includes(searchLower)
			);
		});

		// Apply pagination after filtering
		const from = page * pageSize;
		const to = from + pageSize;
		const paginatedData = filteredData.slice(from, to);
		const hasMore = to < filteredData.length;

		return {
			jobs: paginatedData,
			hasMore,
		};
	}

	// For non-search queries, use count from database
	const hasMore =
		count !== null && count !== undefined
			? page * pageSize + filteredData.length < count
			: false;

	return {
		jobs: filteredData,
		hasMore,
	};
}
