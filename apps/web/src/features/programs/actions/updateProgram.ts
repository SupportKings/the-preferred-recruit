"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { programUpdateSchema } from "../types/program";

export const updateProgramAction = actionClient
	.schema(programUpdateSchema)
	.action(async ({ parsedInput }) => {
		// Authentication check
		const user = await getUser();
		if (!user) {
			return returnValidationErrors(programUpdateSchema, {
				_errors: ["You must be logged in to update a program"],
			});
		}

		const supabase = await createClient();
		const { id, ...updateData } = parsedInput;

		// Check if program exists
		const { data: existingProgram } = await (supabase as any)
			.from("programs")
			.select("id, university_id")
			.eq("id", id)
			.maybeSingle();

		if (!existingProgram) {
			return returnValidationErrors(programUpdateSchema, {
				_errors: ["Program not found"],
			});
		}

		// Update program
		const { data: program, error: updateError } = await (supabase as any)
			.from("programs")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (updateError) {
			console.error("Error updating program:", updateError);
			return returnValidationErrors(programUpdateSchema, {
				_errors: [`Failed to update program: ${updateError.message}`],
			});
		}

		// Revalidate paths
		revalidatePath("/dashboard/universities");
		revalidatePath(`/dashboard/universities/${existingProgram.university_id}`);
		revalidatePath(`/dashboard/programs/${id}`);

		return {
			success: true,
			data: program,
		};
	});
