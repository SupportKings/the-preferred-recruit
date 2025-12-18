"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import type { CoachExportServerFilters } from "../types/coach-export-types";

export interface CoachFilterOptions {
	divisions: Array<{ name: string; count: number }>;
	universities: Array<{ id: string; name: string; count: number }>;
	programs: Array<{
		id: string;
		name: string;
		universityId: string;
		count: number;
	}>;
}

export async function getCampaignCoachFilterOptionsAction(
	filters?: CoachExportServerFilters,
) {
	try {
		const session = await getUser();
		if (!session?.user) {
			return {
				success: false,
				error: "You must be logged in",
			};
		}

		const supabase = await createClient();

		// Extract filter values for RPC calls
		const divisionNames = filters?.divisions?.values || null;
		const universityIds = filters?.universities?.values || null;
		const programIds = filters?.programs?.values || null;

		// Query counts via filtered RPC functions
		const [divisionResult, universityResult, programResult] = await Promise.all(
			[
				supabase.rpc("get_filtered_coach_division_counts", {
					p_university_ids: universityIds,
					p_program_ids: programIds,
				}),
				supabase.rpc("get_filtered_coach_university_counts", {
					p_division_names: divisionNames,
					p_program_ids: programIds,
				}),
				supabase.rpc("get_filtered_coach_program_counts", {
					p_division_names: divisionNames,
					p_university_ids: universityIds,
				}),
			],
		);

		// Process division counts
		let divisionsWithCounts: Array<{ name: string; count: number }> = [];
		if (divisionResult.error) {
			console.error("Error fetching division counts:", divisionResult.error);
		} else {
			divisionsWithCounts = (
				divisionResult.data as Array<{
					division_name: string;
					coach_count: number;
				}>
			).map((d) => ({
				name: d.division_name,
				count: Number(d.coach_count),
			}));
		}

		// Process university counts
		let universitiesWithCounts: Array<{
			id: string;
			name: string;
			count: number;
		}> = [];
		if (universityResult.error) {
			console.error(
				"Error fetching university counts:",
				universityResult.error,
			);
		} else {
			universitiesWithCounts = (
				universityResult.data as Array<{
					university_id: string;
					university_name: string;
					coach_count: number;
				}>
			).map((u) => ({
				id: u.university_id,
				name: u.university_name,
				count: Number(u.coach_count),
			}));
		}

		// Process program counts
		let programsWithCounts: Array<{
			id: string;
			name: string;
			universityId: string;
			count: number;
		}> = [];
		if (programResult.error) {
			console.error("Error fetching program counts:", programResult.error);
		} else {
			programsWithCounts = (
				programResult.data as Array<{
					program_id: string;
					program_name: string;
					university_id: string;
					coach_count: number;
				}>
			).map((p) => ({
				id: p.program_id,
				name: p.program_name,
				universityId: p.university_id,
				count: Number(p.coach_count),
			}));
		}

		const filterOptions: CoachFilterOptions = {
			divisions: divisionsWithCounts.sort((a, b) =>
				a.name.localeCompare(b.name),
			),
			universities: universitiesWithCounts.sort((a, b) =>
				a.name.localeCompare(b.name),
			),
			programs: programsWithCounts.sort((a, b) => a.name.localeCompare(b.name)),
		};

		return {
			success: true,
			data: filterOptions,
		};
	} catch (error) {
		console.error(
			"Unexpected error in getCampaignCoachFilterOptionsAction:",
			error,
		);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "An unexpected error occurred",
		};
	}
}
