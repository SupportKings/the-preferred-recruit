"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const updateUniversitySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).optional(),
	email_blocked: z.boolean().optional(),
	type_public_private: z.string().optional().nullable(),
	religious_affiliation: z.string().optional().nullable(),
	city: z.string().optional().nullable(),
	size_of_city: z.string().optional().nullable(),
	state: z.string().optional().nullable(),
	region: z.string().optional().nullable(),
	average_gpa: z.number().optional().nullable(),
	sat_ebrw_25th: z.number().optional().nullable(),
	sat_ebrw_75th: z.number().optional().nullable(),
	sat_math_25th: z.number().optional().nullable(),
	sat_math_75th: z.number().optional().nullable(),
	act_composite_25th: z.number().optional().nullable(),
	act_composite_75th: z.number().optional().nullable(),
	acceptance_rate_pct: z.number().optional().nullable(),
	total_yearly_cost: z.number().optional().nullable(),
	majors_offered_url: z.string().url().optional().nullable().or(z.literal("")),
	undergraduate_enrollment: z.number().optional().nullable(),
	us_news_ranking_national_2018: z.number().optional().nullable(),
	us_news_ranking_liberal_arts_2018: z.number().optional().nullable(),
	ipeds_nces_id: z.string().optional().nullable(),
	internal_notes: z.string().optional().nullable(),
	institution_flags_raw: z.string().optional().nullable(),
});

export const updateUniversity = actionClient
	.inputSchema(updateUniversitySchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// Remove undefined values
			const cleanedData = Object.fromEntries(
				Object.entries(updateData).filter(([_, value]) => value !== undefined),
			);

			// Update the university
			const { data, error } = await supabase
				.from("universities")
				.update(cleanedData)
				.eq("id", id)
				.select()
				.single();

			if (error) {
				console.error("Error updating university:", error);
				throw new Error("Failed to update university");
			}

			// Revalidate paths
			revalidatePath("/dashboard/universities");
			revalidatePath(`/dashboard/universities/${id}`);

			return { success: true, data };
		} catch (error) {
			console.error("Unexpected error in updateUniversity:", error);
			throw error;
		}
	});
