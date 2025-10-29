"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

export async function createAthleteResult(
	athleteId: string,
	resultData: {
		event_id: string;
		performance_mark: string;
		date_recorded?: string;
		location?: string;
		hand_timed?: boolean;
		wind?: string;
		altitude?: boolean;
		organized_event?: boolean;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { data, error } = await supabase
		.from("athlete_results")
		.insert({
			athlete_id: athleteId,
			event_id: resultData.event_id,
			performance_mark: resultData.performance_mark,
			date_recorded: resultData.date_recorded || null,
			location: resultData.location || null,
			hand_timed: resultData.hand_timed || false,
			wind: resultData.wind || null,
			altitude: resultData.altitude || false,
			organized_event: resultData.organized_event ?? true,
			internal_notes: resultData.internal_notes || null,
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create athlete result: ${error.message}`);
	}

	return { success: true, data };
}

export async function updateAthleteResult(
	resultId: string,
	resultData: {
		event_id?: string;
		performance_mark?: string;
		date_recorded?: string;
		location?: string;
		hand_timed?: boolean;
		wind?: string;
		altitude?: boolean;
		organized_event?: boolean;
		internal_notes?: string;
	},
) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("athlete_results")
		.update(resultData)
		.eq("id", resultId);

	if (error) {
		throw new Error(`Failed to update athlete result: ${error.message}`);
	}

	return { success: true };
}

export async function deleteAthleteResult(resultId: string) {
	const supabase = await createClient();
	const user = await getUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	const { error } = await supabase
		.from("athlete_results")
		.delete()
		.eq("id", resultId);

	if (error) {
		throw new Error(`Failed to delete athlete result: ${error.message}`);
	}

	return { success: true };
}
