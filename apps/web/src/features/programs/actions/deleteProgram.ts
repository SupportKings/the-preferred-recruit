"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { z } from "zod";

const deleteProgramSchema = z.object({
	id: z.string().uuid(),
});

export const deleteProgramAction = actionClient
	.schema(deleteProgramSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Authentication check
			const user = await getUser();
			if (!user) {
				return {
					success: false,
					error: "You must be logged in to delete a program",
				};
			}

			const supabase = await createClient();

			// Get program to find university_id for revalidation
			const { data: program } = await (supabase as any)
				.from("programs")
				.select("id, university_id")
				.eq("id", parsedInput.id)
				.maybeSingle();

			if (!program) {
				return {
					success: false,
					error: "Program not found",
				};
			}

			// Soft delete by setting is_deleted flag
			const { error: deleteError } = await (supabase as any)
				.from("programs")
				.update({
					is_deleted: true,
					deleted_at: new Date().toISOString(),
					deleted_by: user.user.id,
				})
				.eq("id", parsedInput.id);

			if (deleteError) {
				console.error("Error deleting program:", deleteError);
				return {
					success: false,
					error: `Failed to delete program: ${deleteError.message}`,
				};
			}

			// Revalidate paths
			revalidatePath("/dashboard/universities");
			revalidatePath(`/dashboard/universities/${program.university_id}`);
			revalidatePath(`/dashboard/programs/${parsedInput.id}`);

			return {
				success: true,
			};
		} catch (error) {
			console.error("Unexpected error in deleteProgramAction:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			};
		}
	});
