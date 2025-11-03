"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const deleteUniversitySchema = z.object({
	id: z.string().uuid(),
});

export const deleteUniversity = actionClient
	.inputSchema(deleteUniversitySchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user?.id) {
				return returnValidationErrors(deleteUniversitySchema, {
					_errors: ["Unauthorized: No active session"],
				});
			}

			// Get the team member ID of the current user (for deleted_by field)
			const { data: currentTeamMember } = await supabase
				.from("team_members")
				.select("id")
				.eq("user_id", session.user.id)
				.eq("is_deleted", false)
				.single();

			// Soft delete the university by setting is_deleted flag
			const { error } = await supabase
				.from("universities")
				.update({
					is_deleted: true,
					deleted_at: new Date().toISOString(),
					deleted_by: currentTeamMember?.id || null,
				})
				.eq("id", parsedInput.id);

			if (error) {
				throw new Error(`Failed to delete university: ${error.message}`);
			}

			return { success: true };
		} catch (error) {
			console.error("Unexpected error in deleteUniversity:", error);
			return returnValidationErrors(deleteUniversitySchema, {
				_errors: ["Failed to delete university. Please try again."],
			});
		}
	});
