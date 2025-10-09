"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const deleteUniversitySchema = z.object({
	id: z.string().uuid(),
});

export const deleteUniversity = actionClient
	.inputSchema(deleteUniversitySchema)
	.action(async ({ parsedInput }) => {
		const { id } = parsedInput;

		try {
			const supabase = await createClient();

			// Delete the university
			const { error } = await supabase
				.from("universities")
				.delete()
				.eq("id", id);

			if (error) {
				console.error("Error deleting university:", error);
				throw new Error("Failed to delete university");
			}

			// Revalidate paths
			revalidatePath("/dashboard/universities");
			revalidatePath(`/dashboard/universities/${id}`);

			return { success: true };
		} catch (error) {
			console.error("Unexpected error in deleteUniversity:", error);
			throw error;
		}
	});
