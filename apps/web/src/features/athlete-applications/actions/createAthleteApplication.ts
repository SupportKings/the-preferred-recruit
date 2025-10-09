"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { athleteApplicationCreateSchema } from "../types/athleteApplication";

export const createAthleteApplicationAction = actionClient
	.schema(athleteApplicationCreateSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Authentication check
			const user = await getUser();
			if (!user) {
				return {
					success: false,
					error: "You must be logged in to create an application",
				};
			}

			const supabase = await createClient();

			// Validate that program belongs to the selected university
			if (parsedInput.program_id && parsedInput.university_id) {
				const { data: program, error: programError } = await (supabase as any)
					.from("programs")
					.select("id, university_id")
					.eq("id", parsedInput.program_id)
					.single();

				if (programError || !program) {
					return {
						success: false,
						error: "Selected program not found",
						validationErrors: {
							program_id: {
								_errors: ["Invalid program selection"],
							},
						},
					};
				}

				if (program.university_id !== parsedInput.university_id) {
					return {
						success: false,
						error:
							"Selected program does not belong to the selected university",
						validationErrors: {
							program_id: {
								_errors: ["Program must belong to selected university"],
							},
						},
					};
				}
			}

			// Check for duplicate application (same athlete + university + program)
			if (
				parsedInput.athlete_id &&
				parsedInput.university_id &&
				parsedInput.program_id
			) {
				const { data: existingApplication } = await (supabase as any)
					.from("athlete_applications")
					.select("id")
					.eq("athlete_id", parsedInput.athlete_id)
					.eq("university_id", parsedInput.university_id)
					.eq("program_id", parsedInput.program_id)
					.eq("is_deleted", false)
					.maybeSingle();

				if (existingApplication) {
					return {
						success: false,
						error:
							"An application already exists for this athlete, university, and program combination",
						validationErrors: {
							athlete_id: {
								_errors: ["Duplicate application"],
							},
						},
					};
				}
			}

			// Insert athlete application - Postgres should auto-generate the id via gen_random_uuid()
			const { data: application, error: insertError } = await (supabase as any)
				.from("athlete_applications")
				.insert([
					{
						...parsedInput,
						is_deleted: false,
					},
				])
				.select()
				.single();

			if (insertError) {
				console.error("Error creating athlete application:", insertError);
				return {
					success: false,
					error: `Failed to create application: ${insertError.message}`,
				};
			}

			// Revalidate paths
			revalidatePath("/dashboard/athlete-applications");
			revalidatePath("/dashboard/athlete-applications/applications/add");

			return {
				success: true,
				data: application,
			};
		} catch (error) {
			console.error(
				"Unexpected error in createAthleteApplicationAction:",
				error,
			);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			};
		}
	});
