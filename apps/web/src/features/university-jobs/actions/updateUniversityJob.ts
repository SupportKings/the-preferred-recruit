"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { universityJobUpdateSchema } from "../types/university-job";

export const updateUniversityJobAction = actionClient
	.inputSchema(universityJobUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if university job exists
			const { data: existingJob, error: fetchError } = await supabase
				.from("university_jobs")
				.select("id")
				.eq("id", id)
				.eq("is_deleted", false)
				.single();

			if (fetchError || !existingJob) {
				return returnValidationErrors(universityJobUpdateSchema, {
					_errors: ["University job not found"],
				});
			}

			// 2. Prepare update data (remove undefined values)
			const cleanUpdateData: Record<string, unknown> = {};

			if (updateData.coach_id !== undefined) {
				cleanUpdateData.coach_id = updateData.coach_id;
			}
			if (updateData.job_title !== undefined) {
				cleanUpdateData.job_title = updateData.job_title;
			}
			if (updateData.program_scope !== undefined) {
				cleanUpdateData.program_scope = updateData.program_scope;
			}
			if (updateData.university_id !== undefined) {
				cleanUpdateData.university_id = updateData.university_id;
			}
			if (updateData.program_id !== undefined) {
				cleanUpdateData.program_id = updateData.program_id;
			}
			if (updateData.work_email !== undefined) {
				cleanUpdateData.work_email = updateData.work_email;
			}
			if (updateData.work_phone !== undefined) {
				cleanUpdateData.work_phone = updateData.work_phone;
			}
			if (updateData.start_date !== undefined) {
				cleanUpdateData.start_date = updateData.start_date;
			}
			if (updateData.end_date !== undefined) {
				cleanUpdateData.end_date = updateData.end_date;
			}
			if (updateData.internal_notes !== undefined) {
				cleanUpdateData.internal_notes = updateData.internal_notes;
			}

			// 3. Update the university job record
			const { data: updatedJob, error: updateError } = await supabase
				.from("university_jobs")
				.update(cleanUpdateData)
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating university job:", updateError);
				return returnValidationErrors(universityJobUpdateSchema, {
					_errors: ["Failed to update university job. Please try again."],
				});
			}

			if (!updatedJob) {
				return returnValidationErrors(universityJobUpdateSchema, {
					_errors: ["University job update failed. Please try again."],
				});
			}

			// 4. Revalidate relevant paths
			revalidatePath("/dashboard/university-jobs");
			revalidatePath(`/dashboard/university-jobs/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "University job updated successfully",
					universityJob: updatedJob,
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateUniversityJob:", error);

			return returnValidationErrors(universityJobUpdateSchema, {
				_errors: ["Failed to update university job. Please try again."],
			});
		}
	});
