"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export interface CoachFilterOptions {
	divisions: string[];
	universities: Array<{ id: string; name: string }>;
	programs: Array<{ id: string; name: string; universityId: string }>;
}

export async function getCampaignCoachFilterOptionsAction() {
	try {
		const session = await getUser();
		if (!session?.user) {
			return {
				success: false,
				error: "You must be logged in",
			};
		}

		const supabase = await createClient();

		// Get all divisions directly
		const { data: allDivisions, error: divError } = await supabase
			.from("divisions")
			.select("name")
			.order("name");

		if (divError) {
			console.error("Error fetching divisions:", divError);
		}

		// Get all unique universities and programs from university_jobs
		const { data: universityJobs, error } = await supabase
			.from("university_jobs")
			.select(
				`
				program_id,
				university_id,
				programs:program_id (
					id,
					gender,
					universities!programs_university_id_fkey (
						id,
						name
					)
				),
				universities:university_id (
					id,
					name
				)
			`,
			)
			.is("is_deleted", false)
			.not("coach_id", "is", null);

		if (error) {
			console.error("Error fetching filter options:", error);
			return {
				success: false,
				error: error.message,
			};
		}

		// Extract unique values
		const universitiesMap = new Map<string, string>();
		const programsMap = new Map<
			string,
			{ name: string; universityId: string }
		>();

		for (const job of universityJobs || []) {
			// universities is returned as an array from the join, get the first element
			const university = Array.isArray(job.universities)
				? job.universities[0]
				: job.universities;
			if (university?.id && university?.name) {
				universitiesMap.set(university.id, university.name);
			}

			// programs is also returned as an array from the join
			const program = Array.isArray(job.programs)
				? job.programs[0]
				: job.programs;

			// Program name is university name + gender
			// programs.universities is also an array from the join
			const programUniversity = Array.isArray(program?.universities)
				? program?.universities[0]
				: program?.universities;
			if (program?.id && programUniversity?.id) {
				const universityId = programUniversity.id;
				const programName =
					`${programUniversity.name} ${program.gender || ""}`.trim();
				programsMap.set(program.id, { name: programName, universityId });
			}
		}

		const filterOptions: CoachFilterOptions = {
			divisions: (allDivisions || [])
				.map((d) => d.name)
				.filter(Boolean) as string[],
			universities: Array.from(universitiesMap.entries())
				.map(([id, name]) => ({ id, name }))
				.sort((a, b) => a.name.localeCompare(b.name)),
			programs: Array.from(programsMap.entries())
				.map(([id, { name, universityId }]) => ({ id, name, universityId }))
				.sort((a, b) => a.name.localeCompare(b.name)),
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
