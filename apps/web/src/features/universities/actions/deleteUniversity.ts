import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/client";

import { z } from "zod";

const deleteUniversitySchema = z.object({
	id: z.string().uuid(),
});

export const deleteUniversity = actionClient
	.inputSchema(deleteUniversitySchema)
	.action(async ({ parsedInput }) => {
		const supabase = createClient();

		// Soft delete the university by setting is_deleted flag
		const { error } = await (supabase as any)
			.from("universities")
			.update({
				is_deleted: true,
				deleted_at: new Date().toISOString(),
			})
			.eq("id", parsedInput.id);

		if (error) {
			throw new Error(`Failed to delete university: ${error.message}`);
		}

		return { success: true };
	});
