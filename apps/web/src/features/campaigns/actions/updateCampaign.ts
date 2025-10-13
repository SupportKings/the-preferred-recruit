"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const updateCampaignSchema = z.object({
	id: z.string().uuid(),
	name: z.string().optional(),
	type: z.string().optional(),
	status: z.string().optional(),
	primary_lead_list_id: z.string().uuid().nullable().optional(),
	seed_campaign_id: z.string().uuid().nullable().optional(),
	start_date: z.string().nullable().optional(),
	end_date: z.string().nullable().optional(),
	daily_send_cap: z.number().nullable().optional(),
	leads_total: z.number().nullable().optional(),
	leads_loaded: z.number().nullable().optional(),
	leads_remaining: z.number().nullable().optional(),
	sending_tool_campaign_url: z.string().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
});

export const updateCampaignAction = actionClient
	.schema(updateCampaignSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// First, get the campaign to find related paths to revalidate
			const { data: campaign } = await supabase
				.from("campaigns")
				.select("primary_lead_list_id, athlete_id")
				.eq("id", id)
				.single();

			const { error } = await supabase
				.from("campaigns")
				.update(updateData)
				.eq("id", id);

			if (error) {
				console.error("Error updating campaign:", error);
				return {
					success: false,
					error: "Failed to update campaign. Please try again.",
				};
			}

			// Revalidate relevant paths
			revalidatePath(`/dashboard/campaigns/${id}`);
			revalidatePath("/dashboard/campaigns");

			// Revalidate athlete page if we have athlete_id
			if (campaign?.athlete_id) {
				revalidatePath(`/dashboard/athletes/${campaign.athlete_id}`);
			}

			// Revalidate lead list page if we have primary_lead_list_id
			if (campaign?.primary_lead_list_id) {
				revalidatePath(
					`/dashboard/school-lead-lists/${campaign.primary_lead_list_id}`,
				);
			}

			return {
				success: true,
			};
		} catch (error) {
			console.error("Unexpected error in updateCampaignAction:", error);
			return {
				success: false,
				error: "Failed to update campaign. Please try again.",
			};
		}
	});
