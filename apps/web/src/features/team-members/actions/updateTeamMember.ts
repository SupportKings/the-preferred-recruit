"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import {
	splitFullName,
	teamMemberEditFormSchema,
} from "@/features/team-members/types/team-member";

import { returnValidationErrors } from "next-safe-action";

export const updateTeamMemberAction = actionClient
	.inputSchema(teamMemberEditFormSchema)
	.action(async ({ parsedInput }) => {
		const { id, name, job_title, timezone, internal_notes } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if team member exists
			const { data: existingTeamMember, error: fetchError } = await supabase
				.from("team_members")
				.select("id")
				.eq("id", id)
				.single();

			if (fetchError || !existingTeamMember) {
				return returnValidationErrors(teamMemberEditFormSchema, {
					_errors: ["Team member not found"],
				});
			}

			// 2. Split the name into first and last name
			const { first_name, last_name } = splitFullName(name);

			// 3. Prepare update data
			const updateData: {
				first_name: string;
				last_name: string;
				job_title?: string | null;
				timezone?: string | null;
				internal_notes?: string | null;
				updated_at: string;
			} = {
				first_name,
				last_name,
				updated_at: new Date().toISOString(),
			};

			// Only include optional fields if they were provided
			if (job_title !== undefined) {
				updateData.job_title = job_title || null;
			}
			if (timezone !== undefined) {
				updateData.timezone = timezone || null;
			}
			if (internal_notes !== undefined) {
				updateData.internal_notes = internal_notes || null;
			}

			// 4. Update the team member record
			const { data: updatedTeamMember, error: updateError } = await supabase
				.from("team_members")
				.update(updateData)
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating team member:", updateError);
				return returnValidationErrors(teamMemberEditFormSchema, {
					_errors: ["Failed to update team member. Please try again."],
				});
			}

			if (!updatedTeamMember) {
				return returnValidationErrors(teamMemberEditFormSchema, {
					_errors: ["Team member update failed. Please try again."],
				});
			}

			// 5. Revalidate relevant paths
			revalidatePath("/dashboard/team-members");
			revalidatePath(`/dashboard/team-members/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Team member updated successfully",
					teamMember: {
						id: updatedTeamMember.id,
						first_name: updatedTeamMember.first_name,
						last_name: updatedTeamMember.last_name,
						job_title: updatedTeamMember.job_title,
						timezone: updatedTeamMember.timezone,
						internal_notes: updatedTeamMember.internal_notes,
					},
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateTeamMember:", error);

			return returnValidationErrors(teamMemberEditFormSchema, {
				_errors: ["Failed to update team member. Please try again."],
			});
		}
	});
