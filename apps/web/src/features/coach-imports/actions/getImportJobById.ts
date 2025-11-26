"use server";

import { z } from "zod";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import type { ImportJobWithUploader } from "../types/import-types";

const schema = z.object({
	jobId: z.string().uuid(),
});

export const getImportJobByIdAction = actionClient
	.schema(schema)
	.action(async ({ parsedInput }) => {
		try {
			const session = await getUser();
			if (!session?.user) {
				return {
					success: false,
					error: "You must be logged in",
				};
			}

			const supabase = await createClient();

			const { data: job, error } = await supabase
				.from("coach_import_jobs")
				.select(
					`
					*,
					uploader:uploaded_by (
						id,
						first_name,
						last_name,
						email
					)
				`,
				)
				.eq("id", parsedInput.jobId)
				.single();

			if (error) {
				console.error("Error fetching import job:", error);
				return {
					success: false,
					error: error.message,
				};
			}

			return {
				success: true,
				data: job as unknown as ImportJobWithUploader,
			};
		} catch (error) {
			console.error("Unexpected error in getImportJobByIdAction:", error);
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "An unexpected error occurred",
			};
		}
	});
