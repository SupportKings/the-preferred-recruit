"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

const deleteUniversityJobSchema = z.object({
	id: z.string().uuid(),
});

export const deleteUniversityJob = actionClient
	.inputSchema(deleteUniversityJobSchema)
	.action(async ({ parsedInput: { id } }) => {
		const supabase = await createClient();

		const { error } = await supabase
			.from("university_jobs")
			.update({ is_deleted: true, deleted_at: new Date().toISOString() })
			.eq("id", id);

		if (error) {
			throw new Error(`Failed to delete university job: ${error.message}`);
		}

		revalidatePath("/dashboard/university-jobs");
		revalidatePath("/dashboard");

		return { success: true };
	});
