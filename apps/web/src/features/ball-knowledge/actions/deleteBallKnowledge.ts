"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const deleteBallKnowledgeSchema = z.object({
	id: z.string().uuid(),
});

export const deleteBallKnowledge = actionClient
	.inputSchema(deleteBallKnowledgeSchema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		const { error } = await supabase
			.from("ball_knowledge")
			.update({
				is_deleted: true,
				deleted_at: new Date().toISOString(),
			})
			.eq("id", parsedInput.id);

		if (error) {
			throw new Error(`Failed to delete ball knowledge: ${error.message}`);
		}

		// Revalidate relevant pages
		revalidatePath("/dashboard/coaches");
		revalidatePath("/dashboard/universities");
		revalidatePath("/dashboard/programs");

		return { success: true };
	});
