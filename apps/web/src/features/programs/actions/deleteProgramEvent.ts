"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const programEventDeleteSchema = z.object({
	id: z.string().uuid(),
	program_id: z.string().uuid(),
});

export const deleteProgramEventAction = actionClient
	.schema(programEventDeleteSchema)
	.action(async ({ parsedInput }) => {
		const user = await getUser();
		if (!user) {
			return returnValidationErrors(programEventDeleteSchema, {
				_errors: ["You must be logged in to delete a program event"],
			});
		}

		const supabase = await createClient();

		const { error: deleteError } = await (supabase as any)
			.from("program_events")
			.update({
				is_deleted: true,
				deleted_at: new Date().toISOString(),
			})
			.eq("id", parsedInput.id);

		if (deleteError) {
			console.error("Error deleting program event:", deleteError);
			return returnValidationErrors(programEventDeleteSchema, {
				_errors: [`Failed to delete program event: ${deleteError.message}`],
			});
		}

		revalidatePath(`/dashboard/programs/${parsedInput.program_id}`);

		return {
			success: true,
		};
	});
