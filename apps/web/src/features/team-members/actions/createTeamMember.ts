"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { splitFullName, teamMemberFormSchema } from "../types/team-member";

export const createTeamMemberAction = actionClient
	.schema(teamMemberFormSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Authentication check
			const user = await getUser();
			if (!user) {
				return {
					success: false,
					error: "You must be logged in to create a team member",
				};
			}

			const supabase = await createClient();

			// Split full name into first and last name
			const { first_name, last_name } = splitFullName(parsedInput.name);

			// Prepare data for insertion
			const insertData = {
				first_name,
				last_name,
				job_title: parsedInput.job_title || null,
				timezone: parsedInput.timezone || null,
				internal_notes: parsedInput.internal_notes || null,
			};

			// Insert team member - Postgres should auto-generate the id via gen_random_uuid()
			const { data: teamMember, error: insertError } = await (supabase as any)
				.from("team_members")
				.insert([insertData])
				.select()
				.single();

			if (insertError) {
				console.error("Error creating team member:", insertError);
				return {
					success: false,
					error: `Failed to create team member: ${insertError.message}`,
				};
			}

			// Revalidate paths
			revalidatePath("/dashboard/team-members");
			revalidatePath("/dashboard/team-members/add");

			return {
				success: true,
				data: teamMember,
			};
		} catch (error) {
			console.error("Unexpected error in createTeamMemberAction:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			};
		}
	});
