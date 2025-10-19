"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const createUniversityJobSchema = z.object({
	university_id: z.string().uuid(),
	coach_id: z.string().uuid().nullable().optional(),
	program_id: z.string().uuid().nullable().optional(),
	program_scope: z.enum(["men", "women", "both", "n/a"]).nullable().optional(),
	job_title: z.string().nullable().optional(),
	work_email: z.string().email().nullable().optional(),
	work_phone: z.string().nullable().optional(),
	start_date: z.string().nullable().optional(),
	end_date: z.string().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
});

export const createUniversityJobAction = actionClient
	.inputSchema(createUniversityJobSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// 1. Verify university exists
			const { data: university, error: universityError } = await supabase
				.from("universities")
				.select("id")
				.eq("id", parsedInput.university_id)
				.eq("is_deleted", false)
				.single();

			if (universityError || !university) {
				return returnValidationErrors(createUniversityJobSchema, {
					university_id: {
						_errors: ["University not found"],
					},
				});
			}

			// 2. If coach_id is provided, verify coach exists
			if (parsedInput.coach_id) {
				const { data: coach, error: coachError } = await supabase
					.from("coaches")
					.select("id")
					.eq("id", parsedInput.coach_id)
					.eq("is_deleted", false)
					.single();

				if (coachError || !coach) {
					return returnValidationErrors(createUniversityJobSchema, {
						coach_id: {
							_errors: ["Coach not found"],
						},
					});
				}
			}

			// 3. If program_id is provided, verify program exists
			if (parsedInput.program_id) {
				const { data: program, error: programError } = await supabase
					.from("programs")
					.select("id")
					.eq("id", parsedInput.program_id)
					.eq("is_deleted", false)
					.single();

				if (programError || !program) {
					return returnValidationErrors(createUniversityJobSchema, {
						program_id: {
							_errors: ["Program not found"],
						},
					});
				}
			}

			// 4. Normalize date values
			const startDate =
				parsedInput.start_date &&
				typeof parsedInput.start_date === "string" &&
				parsedInput.start_date.trim() !== ""
					? parsedInput.start_date
					: null;
			const endDate =
				parsedInput.end_date &&
				typeof parsedInput.end_date === "string" &&
				parsedInput.end_date.trim() !== ""
					? parsedInput.end_date
					: null;

			// 5. Create the university job
			const { data: newJob, error: createError } = await supabase
				.from("university_jobs")
				.insert({
					university_id: parsedInput.university_id,
					coach_id: parsedInput.coach_id || null,
					program_id: parsedInput.program_id || null,
					program_scope: parsedInput.program_scope || null,
					job_title: parsedInput.job_title || null,
					work_email: parsedInput.work_email || null,
					work_phone: parsedInput.work_phone || null,
					start_date: startDate,
					end_date: endDate,
					internal_notes: parsedInput.internal_notes || null,
				})
				.select()
				.single();

			if (createError) {
				console.error("Error creating university job:", createError);
				return returnValidationErrors(createUniversityJobSchema, {
					_errors: [
						createError.message ||
							"Failed to create university job. Please try again.",
					],
				});
			}

			if (!newJob) {
				return returnValidationErrors(createUniversityJobSchema, {
					_errors: ["University job creation failed. Please try again."],
				});
			}

			// 6. Revalidate relevant paths
			revalidatePath("/dashboard/university-jobs");
			revalidatePath("/dashboard/universities");
			revalidatePath(`/dashboard/universities/${parsedInput.university_id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "University job created successfully",
					universityJob: newJob,
				},
			};
		} catch (error) {
			console.error("Unexpected error in createUniversityJob:", error);

			return returnValidationErrors(createUniversityJobSchema, {
				_errors: ["Failed to create university job. Please try again."],
			});
		}
	});
