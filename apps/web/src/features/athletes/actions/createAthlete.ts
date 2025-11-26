"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { athleteCreateSchema } from "../types/athlete";
import { triggerKickoffWebhook } from "./triggerKickoffWebhook";

export const createAthleteAction = actionClient
	.schema(athleteCreateSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Authentication check
			const user = await getUser();
			if (!user) {
				return returnValidationErrors(athleteCreateSchema, {
					_errors: ["You must be logged in to create an athlete"],
				});
			}

			const supabase = await createClient();

			// Check if athlete with same email already exists (if email provided)
			if (parsedInput.contact_email) {
				const { data: existingAthlete } = await (supabase as any)
					.from("athletes")
					.select("id, full_name")
					.eq("contact_email", parsedInput.contact_email)
					.maybeSingle();

				if (existingAthlete) {
					return returnValidationErrors(athleteCreateSchema, {
						contact_email: {
							_errors: [
								`An athlete with email ${parsedInput.contact_email} already exists: ${existingAthlete.full_name}`,
							],
						},
					});
				}
			}

			// Insert athlete - Postgres should auto-generate the id via gen_random_uuid()
			const { data: athlete, error: insertError } = await (supabase as any)
				.from("athletes")
				.insert([parsedInput])
				.select()
				.single();

			if (insertError) {
				console.error("Error creating athlete:", insertError);
				return returnValidationErrors(athleteCreateSchema, {
					_errors: [`Failed to create athlete: ${insertError.message}`],
				});
			}

			// Trigger kickoff webhook if run_kickoff_automations is true
			if (athlete.run_kickoff_automations) {
				await triggerKickoffWebhook({
					athlete_id: athlete.id,
					discord_channel_id: athlete.discord_channel_id,
					discord_username: athlete.discord_username,
					discord_channel_url: athlete.discord_channel_url,
					full_name: athlete.full_name,
					contact_email: athlete.contact_email,
				});
			}

			// Revalidate paths
			revalidatePath("/dashboard/athletes");
			revalidatePath("/dashboard/athletes/add");

			return {
				success: true,
				data: {
					success: "Athlete created successfully",
					athlete,
				},
			};
		} catch (error) {
			console.error("Unexpected error in createAthleteAction:", error);
			return returnValidationErrors(athleteCreateSchema, {
				_errors: [
					error instanceof Error
						? error.message
						: "An unexpected error occurred while creating athlete",
				],
			});
		}
	});
