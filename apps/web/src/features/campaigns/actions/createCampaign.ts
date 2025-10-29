"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const createCampaignSchema = z.object({
	athlete_id: z.string().uuid(),
	primary_lead_list_id: z.string().uuid().nullable().optional(),
	name: z.string().min(1, "Campaign name is required"),
	type: z.enum(["top", "second_pass", "third_pass", "personal_best"]),
	status: z
		.enum(["draft", "active", "paused", "completed", "exhausted"])
		.default("draft"),
	daily_send_cap: z.number().int().positive().nullable().optional(),
	start_date: z.string().nullable().optional(),
	end_date: z.string().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
});

export const createCampaignAction = actionClient
	.schema(createCampaignSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			const { data, error } = await supabase
				.from("campaigns")
				.insert({
					athlete_id: parsedInput.athlete_id,
					primary_lead_list_id: parsedInput.primary_lead_list_id || null,
					name: parsedInput.name,
					type: parsedInput.type,
					status: parsedInput.status,
					daily_send_cap: parsedInput.daily_send_cap || null,
					start_date: parsedInput.start_date || null,
					end_date: parsedInput.end_date || null,
					internal_notes: parsedInput.internal_notes || null,
				})
				.select()
				.single();

			if (error) {
				console.error("Error creating campaign:", error);
				return {
					success: false,
					error: "Failed to create campaign. Please try again.",
				};
			}

			// Revalidate relevant paths
			revalidatePath("/dashboard/campaigns");
			revalidatePath(`/dashboard/athletes/${parsedInput.athlete_id}`);
			if (parsedInput.primary_lead_list_id) {
				revalidatePath(
					`/dashboard/school-lead-lists/${parsedInput.primary_lead_list_id}`,
				);
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			console.error("Unexpected error in createCampaignAction:", error);
			return {
				success: false,
				error: "Failed to create campaign. Please try again.",
			};
		}
	});
