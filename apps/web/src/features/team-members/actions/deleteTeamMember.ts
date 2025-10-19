"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const deleteTeamMemberSchema = z.object({
	id: z.string().uuid({ message: "Invalid ID format" }),
});

export const deleteTeamMember = actionClient
	.inputSchema(deleteTeamMemberSchema)
	.action(async ({ parsedInput }) => {
		const { id } = parsedInput;

		try {
			const supabase = await createClient();

			// Check if team member exists
			const { data: existingTeamMember, error: fetchError } = await supabase
				.from("team_members")
				.select("id, first_name, last_name")
				.eq("id", id)
				.single();

			if (fetchError || !existingTeamMember) {
				return returnValidationErrors(deleteTeamMemberSchema, {
					_errors: ["Team member not found"],
				});
			}

			// Delete the team member
			const { error: deleteError } = await supabase
				.from("team_members")
				.delete()
				.eq("id", id);

			if (deleteError) {
				console.error("Error deleting team member:", deleteError);
				return returnValidationErrors(deleteTeamMemberSchema, {
					_errors: ["Failed to delete team member. Please try again."],
				});
			}

			// Revalidate relevant paths
			revalidatePath("/dashboard/team-members");
			revalidatePath(`/dashboard/team-members/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Team member deleted successfully",
				},
			};
		} catch (error) {
			console.error("Unexpected error in deleteTeamMember:", error);

			return returnValidationErrors(deleteTeamMemberSchema, {
				_errors: ["Failed to delete team member. Please try again."],
			});
		}
	});
