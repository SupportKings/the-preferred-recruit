"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const programEventUpdateSchema = z.object({
	id: z.string().uuid(),
	program_id: z.string().uuid(),
	event_id: z.string().uuid(),
	is_active: z.boolean().default(true),
	start_date: z.string().optional().nullable(),
	end_date: z.string().optional().nullable(),
	internal_notes: z.string().optional().nullable(),
});

export const updateProgramEventAction = actionClient
	.schema(programEventUpdateSchema)
	.action(async ({ parsedInput }) => {
		const user = await getUser();
		if (!user) {
			return returnValidationErrors(programEventUpdateSchema, {
				_errors: ["You must be logged in to update a program event"],
			});
		}

		const supabase = await createClient();

		const { id, program_id, ...updateData } = parsedInput;

		const { data: programEvent, error: updateError } = await (supabase as any)
			.from("program_events")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (updateError) {
			console.error("Error updating program event:", updateError);
			return returnValidationErrors(programEventUpdateSchema, {
				_errors: [`Failed to update program event: ${updateError.message}`],
			});
		}

		revalidatePath(`/dashboard/programs/${program_id}`);

		return {
			success: true,
			data: programEvent,
		};
	});
