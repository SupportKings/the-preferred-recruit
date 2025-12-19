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
	states: Array<{ name: string; count: number }>;
	conferences: Array<{ id: string; name: string; count: number }>;
	institutionTypes: Array<{ name: string; count: number }>;
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
		const stateNames = filters?.states?.values || null;
		const conferenceIds = filters?.conferences?.values || null;
		const institutionTypes = filters?.institutionFlags?.values || null;

		// Query counts via filtered RPC functions
		// Each filter excludes itself but includes all other active filters
		const [
			divisionResult,
			universityResult,
			programResult,
			stateResult,
			conferenceResult,
			institutionTypeResult,
		] = await Promise.all([
			supabase.rpc("get_filtered_coach_division_counts", {
				p_university_ids: universityIds,
				p_program_ids: programIds,
				p_state_names: stateNames,
				p_conference_ids: conferenceIds,
				p_institution_types: institutionTypes,
			}),
			supabase.rpc("get_filtered_coach_university_counts", {
				p_division_names: divisionNames,
				p_program_ids: programIds,
				p_state_names: stateNames,
				p_conference_ids: conferenceIds,
				p_institution_types: institutionTypes,
			}),
			supabase.rpc("get_filtered_coach_program_counts", {
				p_division_names: divisionNames,
				p_university_ids: universityIds,
				p_state_names: stateNames,
				p_conference_ids: conferenceIds,
				p_institution_types: institutionTypes,
			}),
			supabase.rpc("get_filtered_coach_state_counts", {
				p_division_names: divisionNames,
				p_university_ids: universityIds,
				p_program_ids: programIds,
				p_conference_ids: conferenceIds,
				p_institution_types: institutionTypes,
			}),
			supabase.rpc("get_filtered_coach_conference_counts", {
				p_division_names: divisionNames,
				p_university_ids: universityIds,
				p_program_ids: programIds,
				p_state_names: stateNames,
				p_institution_types: institutionTypes,
			}),
			supabase.rpc("get_filtered_coach_institution_type_counts", {
				p_division_names: divisionNames,
				p_university_ids: universityIds,
				p_program_ids: programIds,
				p_state_names: stateNames,
				p_conference_ids: conferenceIds,
			}),
		]);

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

		// Process state counts
		let statesWithCounts: Array<{ name: string; count: number }> = [];
		if (stateResult.error) {
			console.error("Error fetching state counts:", stateResult.error);
		} else {
			statesWithCounts = (
				stateResult.data as Array<{
					state_name: string;
					coach_count: number;
				}>
			).map((s) => ({
				name: s.state_name,
				count: Number(s.coach_count),
			}));
		}

		// Process conference counts
		let conferencesWithCounts: Array<{
			id: string;
			name: string;
			count: number;
		}> = [];
		if (conferenceResult.error) {
			console.error(
				"Error fetching conference counts:",
				conferenceResult.error,
			);
		} else {
			conferencesWithCounts = (
				conferenceResult.data as Array<{
					conference_id: string;
					conference_name: string;
					coach_count: number;
				}>
			).map((c) => ({
				id: c.conference_id,
				name: c.conference_name,
				count: Number(c.coach_count),
			}));
		}

		// Process institution type counts
		let institutionTypesWithCounts: Array<{ name: string; count: number }> = [];
		if (institutionTypeResult.error) {
			console.error(
				"Error fetching institution type counts:",
				institutionTypeResult.error,
			);
		} else {
			institutionTypesWithCounts = (
				institutionTypeResult.data as Array<{
					institution_type: string;
					coach_count: number;
				}>
			).map((i) => ({
				name: i.institution_type,
				count: Number(i.coach_count),
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
			states: statesWithCounts.sort((a, b) => a.name.localeCompare(b.name)),
			conferences: conferencesWithCounts.sort((a, b) =>
				a.name.localeCompare(b.name),
			),
			// Sort institution types with "No data" first, then alphabetically
			institutionTypes: institutionTypesWithCounts.sort((a, b) => {
				if (a.name === "No data") return -1;
				if (b.name === "No data") return 1;
				return a.name.localeCompare(b.name);
			}),
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
