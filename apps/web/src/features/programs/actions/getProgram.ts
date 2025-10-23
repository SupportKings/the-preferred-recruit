"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllPrograms() {
	const supabase = await createClient();

	const { data: programs, error } = await (supabase as any)
		.from("programs")
		.select(
			`
			id,
			gender,
			university_id,
			universities!programs_university_id_fkey (
				id,
				name,
				state
			)
		`,
		)
		.eq("is_deleted", false);

	if (error) {
		console.error("Error fetching programs:", error);
		return [];
	}

	// Sort by university name in JavaScript since Supabase doesn't support ordering by joined columns
	const sortedPrograms = (programs || []).sort((a: any, b: any) => {
		const nameA = a.universities?.name || "";
		const nameB = b.universities?.name || "";
		return nameA.localeCompare(nameB);
	});

	return sortedPrograms;
}

export async function getProgram(programId: string) {
	const supabase = await createClient();

	const { data: program, error } = await (supabase as any)
		.from("programs")
		.select(
			`
			*,
			universities!programs_university_id_fkey (
				id,
				name,
				city,
				state
			),
			program_events (
				id,
				event_id,
				is_active,
				start_date,
				end_date,
				internal_notes,
				events (
					id,
					code,
					name,
					event_group
				)
			),
			university_jobs (
				id,
				coach_id,
				job_title,
				university_id,
				program_scope,
				work_email,
				work_phone,
				start_date,
				end_date,
				internal_notes,
				coaches (
					id,
					full_name,
					primary_specialty
				),
				universities!university_jobs_university_id_fkey (
					id,
					name,
					city
				)
			)
		`,
		)
		.eq("id", programId)
		.eq("is_deleted", false)
		.eq("program_events.is_deleted", false)
		.eq("university_jobs.is_deleted", false)
		.single();

	if (error) {
		console.error("Error fetching program:", error);
		throw new Error(`Failed to fetch program: ${error.message}`);
	}

	return program;
}
