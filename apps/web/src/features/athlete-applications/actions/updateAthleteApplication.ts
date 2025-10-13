"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Update schema for athlete applications
const updateAthleteApplicationSchema = z.object({
	id: z.string().uuid(),
	// Parties & Target
	athlete_id: z.string().uuid().optional(),
	university_id: z.string().uuid().optional(),
	program_id: z.string().uuid().optional(),
	// Stage & Timing
	stage: z
		.enum(["intro", "ongoing", "visit", "offer", "committed", "dropped"])
		.optional(),
	start_date: z.string().nullable().optional(),
	offer_date: z.string().nullable().optional(),
	commitment_date: z.string().nullable().optional(),
	last_interaction_at: z.string().nullable().optional(),
	// Origin & Attribution
	origin_lead_list_id: z.string().uuid().nullable().optional(),
	origin_lead_list_priority: z.number().nullable().optional(),
	origin_campaign_id: z.string().uuid().nullable().optional(),
	// Scholarship & Notes
	scholarship_amount_per_year: z.number().nullable().optional(),
	scholarship_percent: z.number().nullable().optional(),
	offer_notes: z.string().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
});

export const updateAthleteApplication = actionClient
	.schema(updateAthleteApplicationSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// Check if application exists
			const { data: existing, error: fetchError } = await supabase
				.from("athlete_applications")
				.select("id")
				.eq("id", id)
				.eq("is_deleted", false)
				.single();

			if (fetchError || !existing) {
				return {
					success: false,
					error: "Application not found",
				};
			}

			// Prepare update data (remove undefined values)
			const cleanUpdateData: Record<string, unknown> = {};
			Object.keys(updateData).forEach((key) => {
				const value = updateData[key as keyof typeof updateData];
				if (value !== undefined) {
					cleanUpdateData[key] = value === "" ? null : value;
				}
			});

			// Update the application
			const { data: updated, error: updateError } = await supabase
				.from("athlete_applications")
				.update({
					...cleanUpdateData,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating application:", updateError);
				return {
					success: false,
					error: "Failed to update application. Please try again.",
				};
			}

			// Revalidate relevant paths
			revalidatePath("/dashboard/athlete-applications");
			revalidatePath(`/dashboard/athlete-applications/${id}`);

			return {
				success: true,
				data: updated,
			};
		} catch (error) {
			console.error("Unexpected error in updateAthleteApplication:", error);
			return {
				success: false,
				error: "Failed to update application. Please try again.",
			};
		}
	});
