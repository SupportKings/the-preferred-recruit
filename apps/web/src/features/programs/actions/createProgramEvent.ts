"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const programEventCreateSchema = z.object({
	program_id: z.string().uuid(),
	event_id: z.string().uuid(),
	is_active: z.boolean().default(true),
	start_date: z.string().optional().nullable(),
	end_date: z.string().optional().nullable(),
	internal_notes: z.string().optional().nullable(),
});

export const createProgramEventAction = actionClient
	.schema(programEventCreateSchema)
	.action(async ({ parsedInput }) => {
		const user = await getUser();
		if (!user) {
			return returnValidationErrors(programEventCreateSchema, {
				_errors: ["You must be logged in to create a program event"],
			});
		}

		const supabase = await createClient();

		const { data: programEvent, error: insertError } = await (supabase as any)
			.from("program_events")
			.insert([parsedInput])
			.select()
			.single();

		if (insertError) {
			console.error("Error creating program event:", insertError);
			return returnValidationErrors(programEventCreateSchema, {
				_errors: [`Failed to create program event: ${insertError.message}`],
			});
		}

		revalidatePath(`/dashboard/programs/${parsedInput.program_id}`);

		return {
			success: true,
			data: programEvent,
		};
	});
