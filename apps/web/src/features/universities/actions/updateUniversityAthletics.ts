"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const updateUniversityAthleticsSchema = z.object({
	universityId: z.string().uuid(),
	conferenceId: z.string().uuid().nullable().optional(),
	divisionId: z.string().uuid().nullable().optional(),
});

export const updateUniversityAthletics = actionClient
	.inputSchema(updateUniversityAthleticsSchema)
	.action(async ({ parsedInput }) => {
		const { universityId, conferenceId, divisionId } = parsedInput;

		try {
			const supabase = await createClient();

			// Update conference if provided
			if (conferenceId !== undefined) {
				// Delete existing active conference entries (where end_date is null)
				const { error: deleteConferenceError } = await supabase
					.from("university_conferences")
					.update({ end_date: new Date().toISOString() })
					.eq("university_id", universityId)
					.is("end_date", null);

				if (deleteConferenceError) {
					console.error(
						"Error ending previous conferences:",
						deleteConferenceError,
					);
					throw new Error("Failed to update conference");
				}

				// Insert new conference entry if conferenceId is not null
				if (conferenceId) {
					const { error: insertConferenceError } = await supabase
						.from("university_conferences")
						.insert({
							university_id: universityId,
							conference_id: conferenceId,
							start_date: new Date().toISOString(),
							end_date: null,
						});

					if (insertConferenceError) {
						console.error(
							"Error inserting new conference:",
							insertConferenceError,
						);
						throw new Error("Failed to update conference");
					}
				}
			}

			// Update division if provided
			if (divisionId !== undefined) {
				// Delete existing active division entries (where end_date is null)
				const { error: deleteDivisionError } = await supabase
					.from("university_divisions")
					.update({ end_date: new Date().toISOString() })
					.eq("university_id", universityId)
					.is("end_date", null);

				if (deleteDivisionError) {
					console.error(
						"Error ending previous divisions:",
						deleteDivisionError,
					);
					throw new Error("Failed to update division");
				}

				// Insert new division entry if divisionId is not null
				if (divisionId) {
					const { error: insertDivisionError } = await supabase
						.from("university_divisions")
						.insert({
							university_id: universityId,
							division_id: divisionId,
							start_date: new Date().toISOString(),
							end_date: null,
						});

					if (insertDivisionError) {
						console.error("Error inserting new division:", insertDivisionError);
						throw new Error("Failed to update division");
					}
				}
			}

			// Revalidate paths
			revalidatePath("/dashboard/universities");
			revalidatePath(`/dashboard/universities/${universityId}`);

			return { success: true };
		} catch (error) {
			console.error("Unexpected error in updateUniversityAthletics:", error);
			throw error;
		}
	});
