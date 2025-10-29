"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const programScopeEnum = z.enum(["men", "women", "both", "n/a"]);

const assignCoachSchema = z.object({
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

export const assignCoachToProgramAction = actionClient
	.schema(assignCoachSchema)
	.action(async ({ parsedInput }) => {
		const user = await getUser();
		if (!user) {
			return returnValidationErrors(assignCoachSchema, {
				_errors: ["You must be logged in to assign a coach"],
			});
		}

		const supabase = await createClient();

		const { data: job, error: insertError } = await (supabase as any)
			.from("university_jobs")
			.insert([parsedInput])
			.select()
			.single();

		if (insertError) {
			console.error("Error assigning coach:", insertError);
			return returnValidationErrors(assignCoachSchema, {
				_errors: [`Failed to assign coach: ${insertError.message}`],
			});
		}

		revalidatePath(`/dashboard/programs/${parsedInput.program_id}`);
		revalidatePath(`/dashboard/universities/${parsedInput.university_id}`);

		return {
			success: true,
			data: job,
		};
	});
