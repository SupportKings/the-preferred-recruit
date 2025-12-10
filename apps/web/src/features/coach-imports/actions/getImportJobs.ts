"use server";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import type { ImportJobWithUploader } from "../types/import-types";

export async function getImportJobsAction() {
	try {
		const session = await getUser();
		if (!session?.user) {
			return {
				success: false,
				error: "You must be logged in",
			};
		}

		const supabase = await createClient();

		const { data: jobs, error } = await supabase
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
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching import jobs:", error);
			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: true,
			data: jobs as unknown as ImportJobWithUploader[],
		};
	} catch (error) {
		console.error("Unexpected error in getImportJobsAction:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "An unexpected error occurred",
		};
	}
}
