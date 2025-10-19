"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

export const deleteUniversityJob = actionClient
	.inputSchema(
		z.object({
			id: z.string().uuid(),
		}),
	)
	.action(async ({ parsedInput: { id } }) => {
		try {
			const supabase = await createClient();

			// Check if the record exists
			const { data: existing, error: fetchError } = await supabase
				.from("university_jobs")
				.select("id")
				.eq("id", id)
				.single();

			if (fetchError || !existing) {
				console.error("University job not found:", fetchError);
				return { success: false, error: "University job not found" };
			}

			// Perform hard delete
			const { error } = await supabase
				.from("university_jobs")
				.delete()
				.eq("id", id);

			if (error) {
				console.error("Failed to delete university job:", error);
				return { success: false, error: error.message };
			}

			revalidatePath("/dashboard/university-jobs");
			revalidatePath("/dashboard/coaches");
			revalidatePath("/dashboard");

			return { success: true };
		} catch (error) {
			console.error("Unexpected error deleting university job:", error);
			return {
				success: false,
				error: "An unexpected error occurred while deleting the university job",
			};
		}
	});
