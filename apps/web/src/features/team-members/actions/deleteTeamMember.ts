"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
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

			// Check if team member exists and get user_id
			const { data: existingTeamMember, error: fetchError } = await supabase
				.from("team_members")
				.select("id, first_name, last_name, user_id")
				.eq("id", id)
				.single();

			if (fetchError || !existingTeamMember) {
				return returnValidationErrors(deleteTeamMemberSchema, {
					_errors: ["Team member not found"],
				});
			}

			// If team member has an associated user, ban the user first
			if (existingTeamMember.user_id) {
				try {
					await auth.api.banUser({
						body: {
							userId: existingTeamMember.user_id,
						},
						headers: await headers(),
					});
				} catch (banError) {
					console.error("Error banning user:", banError);
					// Continue with team member deletion even if ban fails
					// The user might already be banned or deleted
				}
			}

			// Delete the team member record
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
				success: "Team member and associated user deleted successfully",
			};
		} catch (error) {
			console.error("Unexpected error in deleteTeamMember:", error);

			return returnValidationErrors(deleteTeamMemberSchema, {
				_errors: ["Failed to delete team member. Please try again."],
			});
		}
	});
