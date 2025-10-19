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
			const { error } = await supabase
				.from("athlete_applications")
				.update({ is_deleted: true, updated_at: new Date().toISOString() })
				.eq("id", id);

			if (error) {
				console.error("Error deleting application:", error);
				return {
					success: false,
					error: "Failed to delete application. Please try again.",
				};
			}

			// Revalidate relevant paths
			revalidatePath("/dashboard/athlete-applications");

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
