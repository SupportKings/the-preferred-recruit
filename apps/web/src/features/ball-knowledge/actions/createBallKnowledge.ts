"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const createBallKnowledgeSchema = z.object({
	note: z.string().min(1, "Note is required"),
	source_type: z.string().optional(),
	review_after: z.string().optional(),
	internal_notes: z.string().optional(),
	from_athlete_id: z.string().uuid().optional(),
	about_coach_id: z.string().uuid().optional(),
	about_university_id: z.string().uuid().optional(),
	about_program_id: z.string().uuid().optional(),
});

export const createBallKnowledge = actionClient
	.inputSchema(createBallKnowledgeSchema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("ball_knowledge")
			.insert({
				note: parsedInput.note,
				source_type: parsedInput.source_type || null,
				review_after: parsedInput.review_after || null,
				internal_notes: parsedInput.internal_notes || null,
				from_athlete_id: parsedInput.from_athlete_id || null,
				about_coach_id: parsedInput.about_coach_id || null,
				about_university_id: parsedInput.about_university_id || null,
				about_program_id: parsedInput.about_program_id || null,
			})
			.select()
			.single();

		if (error) {
			console.error("Ball knowledge creation error:", {
				error,
				message: error.message,
				details: error.details,
				hint: error.hint,
				code: error.code,
				parsedInput,
			});
			throw new Error(`Failed to create ball knowledge: ${error.message}`);
		}

		// Revalidate relevant pages
		revalidatePath("/dashboard/coaches");
		revalidatePath("/dashboard/universities");
		revalidatePath("/dashboard/programs");

		return data;
	});
