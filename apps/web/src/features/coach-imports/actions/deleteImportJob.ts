"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

const schema = z.object({
	jobId: z.string().uuid(),
});

export const deleteImportJobAction = actionClient
	.schema(schema)
	.action(async ({ parsedInput }) => {
		try {
			const session = await getUser();
			if (!session?.user) {
				return {
					success: false,
					error: "You must be logged in",
				};
			}

			const supabase = await createClient();

			// Get team member ID
			const { data: teamMember } = await supabase
				.from("team_members")
				.select("id")
				.eq("user_id", session.user.id)
				.eq("is_deleted", false)
				.maybeSingle();

			if (!teamMember) {
				return {
					success: false,
					error: "Team member not found",
				};
			}

			// Delete the import job
			const { error } = await supabase
				.from("coach_import_jobs")
				.delete()
				.eq("id", parsedInput.jobId);

			if (error) {
				console.error("Error deleting import job:", error);
				return {
					success: false,
					error: error.message,
				};
			}

			revalidatePath("/dashboard/coach-imports");

			return {
				success: true,
			};
		} catch (error) {
			console.error("Unexpected error in deleteImportJobAction:", error);
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "An unexpected error occurred",
			};
		}
	});
