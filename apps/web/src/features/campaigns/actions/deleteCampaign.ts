"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const deleteCampaignSchema = z.object({
	id: z.string().uuid(),
});

export const deleteCampaign = actionClient
	.schema(deleteCampaignSchema)
	.action(async ({ parsedInput }) => {
		const { id } = parsedInput;

		try {
			const supabase = await createClient();

			// Soft delete: set is_deleted to true
			const { error } = await supabase
				.from("campaigns")
				.update({ is_deleted: true, deleted_at: new Date().toISOString() })
				.eq("id", id);

			if (error) {
				console.error("Error deleting campaign:", error);
				return {
					success: false,
					error: "Failed to delete campaign. Please try again.",
				};
			}

			// Revalidate relevant paths
			revalidatePath("/dashboard/campaigns");

			return {
				success: true,
			};
		} catch (error) {
			console.error("Unexpected error in deleteCampaign:", error);
			return {
				success: false,
				error: "Failed to delete campaign. Please try again.",
			};
		}
	});
