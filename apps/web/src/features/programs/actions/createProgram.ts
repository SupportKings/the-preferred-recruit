"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";

import { programCreateSchema } from "../types/program";

export const createProgramAction = actionClient
	.schema(programCreateSchema)
	.action(async ({ parsedInput }) => {
		// Authentication check
		const user = await getUser();
		if (!user) {
			return returnValidationErrors(programCreateSchema, {
				_errors: ["You must be logged in to create a program"],
			});
		}

		const supabase = await createClient();

		// Insert program - Postgres should auto-generate the id via gen_random_uuid()
		const { data: program, error: insertError } = await (supabase as any)
			.from("programs")
			.insert([parsedInput])
			.select()
			.single();

		if (insertError) {
			console.error("Error creating program:", insertError);
			return returnValidationErrors(programCreateSchema, {
				_errors: [`Failed to create program: ${insertError.message}`],
			});
		}

		// Revalidate paths
		revalidatePath("/dashboard/universities");
		revalidatePath(`/dashboard/universities/${parsedInput.university_id}`);

		return {
			success: true,
			data: program,
		};
	});
