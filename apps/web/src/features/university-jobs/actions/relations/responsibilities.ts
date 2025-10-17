"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/queries/getUser";

export async function deleteCoachResponsibility(responsibilityId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("coach_responsibilities")
		.delete()
		.eq("id", responsibilityId);

	if (error) {
		throw new Error(
			`Failed to delete coach responsibility: ${error.message}`,
		);
	}

	return { success: true };
}

export async function createCoachResponsibility(
	universityJobId: string,
	responsibilityData: {
		event_group?: string | null;
		event_id?: string | null;
		internal_notes?: string | null;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("coach_responsibilities")
		.insert({
			university_job_id: universityJobId,
			...responsibilityData,
		})
		.select()
		.single();

	if (error) {
		throw new Error(
			`Failed to create coach responsibility: ${error.message}`,
		);
	}

	return { success: true, data };
}

export async function updateCoachResponsibility(
	responsibilityId: string,
	responsibilityData: {
		event_group?: string | null;
		event_id?: string | null;
		internal_notes?: string | null;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("coach_responsibilities")
		.update(responsibilityData)
		.eq("id", responsibilityId);

	if (error) {
		throw new Error(
			`Failed to update coach responsibility: ${error.message}`,
		);
	}

	return { success: true };
}
