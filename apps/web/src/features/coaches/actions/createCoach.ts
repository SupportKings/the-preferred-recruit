"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { coachCreateSchema } from "../types/coach";

export const createCoachAction = actionClient
	.schema(coachCreateSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Authentication check
			const user = await getUser();
			if (!user) {
				return {
					success: false,
					error: "You must be logged in to create a coach",
				};
			}

			const supabase = await createClient();

			// Check if coach with same email already exists (if email provided)
			if (parsedInput.email) {
				const { data: existingCoach } = await (supabase as any)
					.from("coaches")
					.select("id, full_name")
					.eq("email", parsedInput.email)
					.maybeSingle();

				if (existingCoach) {
					return {
						success: false,
						error: `A coach with email ${parsedInput.email} already exists: ${existingCoach.full_name}`,
						validationErrors: {
							email: {
								_errors: ["This email is already in use"],
							},
						},
					};
				}
			}

			// Separate university_job from coach data
			const { university_job, ...coachData } = parsedInput;

			// Insert coach - Postgres should auto-generate the id via gen_random_uuid()
			const { data: coach, error: insertError } = await (supabase as any)
				.from("coaches")
				.insert([coachData])
				.select()
				.single();

			if (insertError) {
				console.error("Error creating coach:", insertError);
				return {
					success: false,
					error: `Failed to create coach: ${insertError.message}`,
				};
			}

			// Create university_jobs record if data provided
			if (university_job) {
				const universityJobData = {
					coach_id: coach.id,
					university_id: university_job.university_id,
					program_id: university_job.program_id,
					job_title: university_job.job_title,
					work_email: university_job.work_email,
					work_phone: university_job.work_phone,
					start_date: university_job.start_date,
					internal_notes: university_job.internal_notes,
				};

				const { error: jobError } = await (supabase as any)
					.from("university_jobs")
					.insert([universityJobData]);

				if (jobError) {
					console.error("Error creating university job:", jobError);
					// Note: Coach was created successfully, but job creation failed
					return {
						success: true,
						data: coach,
						warning: `Coach created but failed to create university job: ${jobError.message}`,
					};
				}
			}

			// Revalidate paths
			revalidatePath("/dashboard/coaches");
			revalidatePath("/dashboard/coaches/add");

			return {
				success: true,
				data: coach,
			};
		} catch (error) {
			console.error("Unexpected error in createCoachAction:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
			};
		}
	});
