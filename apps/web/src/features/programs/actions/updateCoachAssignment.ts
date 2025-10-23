"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const programScopeEnum = z.enum(["men", "women", "both", "n/a"]);

const updateCoachAssignmentSchema = z.object({
	id: z.string().uuid(),
	program_id: z.string().uuid(),
	university_id: z.string().uuid(),
	coach_id: z.string().uuid(),
	job_title: z.string().optional().nullable(),
	program_scope: programScopeEnum.optional().nullable(),
	work_email: z
		.string()
		.email()
		.optional()
		.nullable()
		.or(z.literal(""))
		.transform((val) => (val === "" ? null : val)),
	work_phone: z.string().optional().nullable(),
	start_date: z.string().optional().nullable(),
	end_date: z.string().optional().nullable(),
	internal_notes: z.string().optional().nullable(),
});

export const updateCoachAssignmentAction = actionClient
	.schema(updateCoachAssignmentSchema)
	.action(async ({ parsedInput }) => {
		const user = await getUser();
		if (!user) {
			return returnValidationErrors(updateCoachAssignmentSchema, {
				_errors: ["You must be logged in to update coach assignment"],
			});
		}

		const supabase = await createClient();

		const { id, program_id, university_id, ...updateData } = parsedInput;

		const { data: job, error: updateError } = await (supabase as any)
			.from("university_jobs")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (updateError) {
			console.error("Error updating coach assignment:", updateError);
			return returnValidationErrors(updateCoachAssignmentSchema, {
				_errors: [`Failed to update coach assignment: ${updateError.message}`],
			});
		}

		revalidatePath(`/dashboard/programs/${program_id}`);
		revalidatePath(`/dashboard/universities/${university_id}`);

		return {
			success: true,
			data: job,
		};
	});
