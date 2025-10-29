"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const removeCoachSchema = z.object({
	id: z.string().uuid(),
	program_id: z.string().uuid(),
});

export const removeCoachFromProgramAction = actionClient
	.schema(removeCoachSchema)
	.action(async ({ parsedInput }) => {
		const user = await getUser();
		if (!user) {
			return returnValidationErrors(removeCoachSchema, {
				_errors: ["You must be logged in to remove a coach"],
			});
		}

		const supabase = await createClient();

		const { error: deleteError } = await (supabase as any)
			.from("university_jobs")
			.update({
				is_deleted: true,
				deleted_at: new Date().toISOString(),
			})
			.eq("id", parsedInput.id);

		if (deleteError) {
			console.error("Error removing coach:", deleteError);
			return returnValidationErrors(removeCoachSchema, {
				_errors: [`Failed to remove coach: ${deleteError.message}`],
			});
		}

		revalidatePath(`/dashboard/programs/${parsedInput.program_id}`);

		return {
			success: true,
		};
	});
