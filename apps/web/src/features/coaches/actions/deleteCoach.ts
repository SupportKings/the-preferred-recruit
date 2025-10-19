"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const deleteCoachSchema = z.object({
	id: z.string().uuid({ message: "Invalid coach ID" }),
});

export const deleteCoach = actionClient
	.inputSchema(deleteCoachSchema)
	.action(async ({ parsedInput: { id } }) => {
		try {
			const supabase = await createClient();
			const user = await getUser();

			if (!user) {
				return returnValidationErrors(deleteCoachSchema, {
					_errors: ["Authentication required"],
				});
			}

			// Check if coach exists
			const { data: existingCoach, error: fetchError } = await supabase
				.from("coaches")
				.select("id, full_name")
				.eq("id", id)
				.single();

			if (fetchError || !existingCoach) {
				return returnValidationErrors(deleteCoachSchema, {
					_errors: ["Coach not found"],
				});
			}

			// Soft delete: update is_deleted flag and deleted_at timestamp
			const { error: deleteError } = await supabase
				.from("coaches")
				.update({
					is_deleted: true,
					deleted_at: new Date().toISOString(),
					deleted_by: user.user.id,
				})
				.eq("id", id);

			if (deleteError) {
				console.error("Error deleting coach:", deleteError);
				return returnValidationErrors(deleteCoachSchema, {
					_errors: ["Failed to delete coach. Please try again."],
				});
			}

			// Revalidate paths
			revalidatePath("/dashboard/coaches");
			revalidatePath(`/dashboard/coaches/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: `${existingCoach.full_name || "Coach"} has been deleted successfully`,
				},
			};
		} catch (error) {
			console.error("Unexpected error in deleteCoach:", error);
			return returnValidationErrors(deleteCoachSchema, {
				_errors: ["Failed to delete coach. Please try again."],
			});
		}
	});
