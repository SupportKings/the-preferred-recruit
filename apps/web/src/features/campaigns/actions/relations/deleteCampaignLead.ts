"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

export const deleteCampaignLead = actionClient
	.inputSchema(
		z.object({
			id: z.string().uuid(),
		}),
	)
	.action(async ({ parsedInput: { id } }) => {
		try {
			const supabase = await createClient();

			// First check if the record exists and is not already deleted
			const { data: existing, error: fetchError } = await supabase
				.from("campaign_leads")
				.select("id, is_deleted")
				.eq("id", id)
				.single();

			if (fetchError || !existing) {
				console.error("Campaign lead not found:", fetchError);
				return { success: false, error: "Campaign lead not found" };
			}

			if (existing.is_deleted) {
				// Already deleted, treat as success
				return { success: true };
			}

			// Perform soft delete
			const { error } = await supabase
				.from("campaign_leads")
				.update({ is_deleted: true, deleted_at: new Date().toISOString() })
				.eq("id", id);

			if (error) {
				console.error("Failed to delete campaign lead:", error);
				return { success: false, error: error.message };
			}

			revalidatePath("/dashboard/campaigns");
			revalidatePath("/dashboard/coaches");
			revalidatePath("/dashboard");

			return { success: true };
		} catch (error) {
			console.error("Unexpected error deleting campaign lead:", error);
			return {
				success: false,
				error: "An unexpected error occurred while deleting the campaign lead",
			};
		}
	});
