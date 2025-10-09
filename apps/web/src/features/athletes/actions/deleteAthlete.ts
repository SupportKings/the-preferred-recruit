"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const deleteAthleteSchema = z.object({
	id: z.string().uuid("Invalid athlete ID format"),
});

export const deleteAthlete = actionClient
	.inputSchema(deleteAthleteSchema)
	.action(async ({ parsedInput }) => {
		const { id } = parsedInput;

		try {
			const supabase = await createClient();

			// Check if athlete exists
			const { data: existingAthlete, error: fetchError } = await (
				supabase as any
			)
				.from("athletes")
				.select("id, full_name")
				.eq("id", id)
				.eq("is_deleted", false)
				.single();

			if (fetchError || !existingAthlete) {
				return returnValidationErrors(deleteAthleteSchema, {
					_errors: ["Athlete not found"],
				});
			}

			// Soft delete the athlete by setting is_deleted flag
			const { error: deleteError } = await (supabase as any)
				.from("athletes")
				.update({
					is_deleted: true,
					deleted_at: new Date().toISOString(),
				})
				.eq("id", id);

			if (deleteError) {
				console.error("Error deleting athlete:", deleteError);
				return returnValidationErrors(deleteAthleteSchema, {
					_errors: ["Failed to delete athlete. Please try again."],
				});
			}

			// Revalidate relevant paths
			revalidatePath("/dashboard/athletes");
			revalidatePath(`/dashboard/athletes/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Athlete deleted successfully",
					athleteId: id,
				},
			};
		} catch (error) {
			console.error("Unexpected error in deleteAthlete:", error);
			return returnValidationErrors(deleteAthleteSchema, {
				_errors: ["Failed to delete athlete. Please try again."],
			});
		}
	});
