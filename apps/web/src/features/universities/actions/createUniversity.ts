"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { universityCreateSchema } from "../types/university";

export const createUniversityAction = actionClient
	.schema(universityCreateSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Authentication check
			const user = await getUser();
			if (!user) {
				return {
					success: false,
					error: "You must be logged in to create a university",
				};
			}

			const supabase = await createClient();

			// Check if university with same name already exists
			const { data: existingUniversity } = await (supabase as any)
				.from("universities")
				.select("id, name")
				.eq("name", parsedInput.name)
				.maybeSingle();

			if (existingUniversity) {
				return {
					success: false,
					error: `A university with name "${parsedInput.name}" already exists`,
					validationErrors: {
						name: {
							_errors: ["This university name is already in use"],
						},
					},
				};
			}

			// Extract conference and division IDs
			const { conferenceId, divisionId, ...universityData } = parsedInput;

			// Insert university - Postgres should auto-generate the id via gen_random_uuid()
			const { data: university, error: insertError } = await (supabase as any)
				.from("universities")
				.insert([universityData])
				.select()
				.single();

			if (insertError) {
				console.error("Error creating university:", insertError);
				return {
					success: false,
					error: `Failed to create university: ${insertError.message}`,
				};
			}

			// Insert conference if provided
			if (conferenceId) {
				const { error: conferenceError } = await supabase
					.from("university_conferences")
					.insert({
						university_id: university.id,
						conference_id: conferenceId,
						start_date: new Date().toISOString(),
						end_date: null,
					});

				if (conferenceError) {
					console.error("Error adding conference:", conferenceError);
					// Don't fail the whole operation, just log
				}
			}

			// Insert division if provided
			if (divisionId) {
				const { error: divisionError } = await supabase
					.from("university_divisions")
					.insert({
						university_id: university.id,
						division_id: divisionId,
						start_date: new Date().toISOString(),
						end_date: null,
					});

				if (divisionError) {
					console.error("Error adding division:", divisionError);
					// Don't fail the whole operation, just log
				}
			}

			// Revalidate paths
			revalidatePath("/dashboard/universities");
			revalidatePath("/dashboard/universities/add");

			return {
				success: true,
				data: university,
			};
		} catch (error) {
			console.error("Unexpected error in createUniversityAction:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			};
		}
	});
