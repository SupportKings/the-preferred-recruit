"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { athleteCreateSchema } from "../types/athlete";

export const createAthleteAction = actionClient
	.schema(athleteCreateSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Authentication check
			const user = await getUser();
			if (!user) {
				return {
					success: false,
					error: "You must be logged in to create an athlete",
				};
			}

			const supabase = await createClient();

			// Check if athlete with same email already exists (if email provided)
			if (parsedInput.contact_email) {
				const { data: existingAthlete } = await (supabase as any)
					.from("athletes")
					.select("id, full_name")
					.eq("contact_email", parsedInput.contact_email)
					.maybeSingle();

				if (existingAthlete) {
					return {
						success: false,
						error: `An athlete with email ${parsedInput.contact_email} already exists: ${existingAthlete.full_name}`,
						validationErrors: {
							contact_email: {
								_errors: ["This email is already in use"],
							},
						},
					};
				}
			}

			// Insert athlete - Postgres should auto-generate the id via gen_random_uuid()
			const { data: athlete, error: insertError } = await (supabase as any)
				.from("athletes")
				.insert([parsedInput])
				.select()
				.single();

			if (insertError) {
				console.error("Error creating athlete:", insertError);
				return {
					success: false,
					error: `Failed to create athlete: ${insertError.message}`,
				};
			}

			// Revalidate paths
			revalidatePath("/dashboard/athletes");
			revalidatePath("/dashboard/athletes/add");

			return {
				success: true,
				data: athlete,
			};
		} catch (error) {
			console.error("Unexpected error in createAthleteAction:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			};
		}
	});
