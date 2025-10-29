"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const deleteAthleteApplicationSchema = z.object({
	id: z.string().uuid(),
});

export const deleteAthleteApplication = actionClient
	.schema(deleteAthleteApplicationSchema)
	.action(async ({ parsedInput }) => {
		const { id } = parsedInput;

		try {
			const supabase = await createClient();

			// Soft delete: set is_deleted to true
			// Do update and select in one operation to get application details for revalidation
			const { data: deletedApplication, error } = await supabase
				.from("athlete_applications")
				.update({ is_deleted: true, updated_at: new Date().toISOString() })
				.eq("id", id)
				.eq("is_deleted", false) // Only update if not already deleted
				.select("id, athlete_id, university_id, program_id")
				.maybeSingle();

			if (error) {
				console.error("Error deleting application:", error);
				return {
					success: false,
					error: "Failed to delete application. Please try again.",
				};
			}

			if (!deletedApplication) {
				return {
					success: false,
					error: "Application not found or already deleted",
				};
			}

			const application = deletedApplication;

			// Revalidate relevant paths
			revalidatePath("/dashboard/athlete-applications");
			revalidatePath(`/dashboard/athlete-applications/${id}`);
			if (application.athlete_id) {
				revalidatePath(`/dashboard/athletes/${application.athlete_id}`);
			}
			if (application.university_id) {
				revalidatePath(`/dashboard/universities/${application.university_id}`);
			}
			if (application.program_id) {
				revalidatePath(`/dashboard/programs/${application.program_id}`);
			}

			return {
				success: true,
			};
		} catch (error) {
			console.error("Unexpected error in deleteAthleteApplication:", error);
			return {
				success: false,
				error: "Failed to delete application. Please try again.",
			};
		}
	});
