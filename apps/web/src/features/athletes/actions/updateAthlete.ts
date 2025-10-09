"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { athleteUpdateSchema } from "../types/athlete";

import { returnValidationErrors } from "next-safe-action";

export const updateAthleteAction = actionClient
	.inputSchema(athleteUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if athlete exists
			const { data: existingAthlete, error: fetchError } = await (
				supabase as any
			)
				.from("athletes")
				.select("id, contact_email")
				.eq("id", id)
				.eq("is_deleted", false)
				.single();

			if (fetchError || !existingAthlete) {
				return returnValidationErrors(athleteUpdateSchema, {
					_errors: ["Athlete not found"],
				});
			}

			// 2. If email is being updated, check for conflicts
			if (
				updateData.contact_email &&
				updateData.contact_email !== existingAthlete.contact_email
			) {
				const { data: emailConflict } = await (supabase as any)
					.from("athletes")
					.select("id")
					.eq("contact_email", updateData.contact_email)
					.neq("id", id)
					.eq("is_deleted", false)
					.single();

				if (emailConflict) {
					return returnValidationErrors(athleteUpdateSchema, {
						contact_email: {
							_errors: ["Athlete with this email already exists"],
						},
					});
				}
			}

			// 3. Prepare update data (remove undefined values)
			const cleanUpdateData: any = {};

			// Map camelCase to snake_case and handle data transformations
			if (updateData.full_name !== undefined)
				cleanUpdateData.full_name = updateData.full_name;
			if (updateData.contact_email !== undefined)
				cleanUpdateData.contact_email = updateData.contact_email;
			if (updateData.phone !== undefined)
				cleanUpdateData.phone = updateData.phone;
			if (updateData.instagram_handle !== undefined)
				cleanUpdateData.instagram_handle = updateData.instagram_handle;
			if (updateData.gender !== undefined)
				cleanUpdateData.gender = updateData.gender;
			if (updateData.date_of_birth !== undefined)
				cleanUpdateData.date_of_birth = updateData.date_of_birth;
			if (updateData.high_school !== undefined)
				cleanUpdateData.high_school = updateData.high_school;
			if (updateData.city !== undefined) cleanUpdateData.city = updateData.city;
			if (updateData.state !== undefined)
				cleanUpdateData.state = updateData.state;
			if (updateData.country !== undefined)
				cleanUpdateData.country = updateData.country;
			if (updateData.graduation_year !== undefined)
				cleanUpdateData.graduation_year = updateData.graduation_year;
			if (updateData.year_entering_university !== undefined)
				cleanUpdateData.year_entering_university =
					updateData.year_entering_university;
			if (updateData.athlete_net_url !== undefined)
				cleanUpdateData.athlete_net_url = updateData.athlete_net_url;
			if (updateData.milesplit_url !== undefined)
				cleanUpdateData.milesplit_url = updateData.milesplit_url;
			if (updateData.google_drive_folder_url !== undefined)
				cleanUpdateData.google_drive_folder_url =
					updateData.google_drive_folder_url;
			if (updateData.sat_score !== undefined)
				cleanUpdateData.sat_score = updateData.sat_score;
			if (updateData.act_score !== undefined)
				cleanUpdateData.act_score = updateData.act_score;
			if (updateData.contract_date !== undefined)
				cleanUpdateData.contract_date = updateData.contract_date;
			if (updateData.go_live_date !== undefined)
				cleanUpdateData.go_live_date = updateData.go_live_date;
			if (updateData.sales_setter_id !== undefined)
				cleanUpdateData.sales_setter_id = updateData.sales_setter_id;
			if (updateData.sales_closer_id !== undefined)
				cleanUpdateData.sales_closer_id = updateData.sales_closer_id;
			if (updateData.lead_source !== undefined)
				cleanUpdateData.lead_source = updateData.lead_source;
			if (updateData.last_sales_call_at !== undefined)
				cleanUpdateData.last_sales_call_at = updateData.last_sales_call_at;
			if (updateData.sales_call_note !== undefined)
				cleanUpdateData.sales_call_note = updateData.sales_call_note;
			if (updateData.sales_call_recording_url !== undefined)
				cleanUpdateData.sales_call_recording_url =
					updateData.sales_call_recording_url;
			if (updateData.initial_contract_amount_usd !== undefined)
				cleanUpdateData.initial_contract_amount_usd =
					updateData.initial_contract_amount_usd;
			if (updateData.initial_cash_collected_usd !== undefined)
				cleanUpdateData.initial_cash_collected_usd =
					updateData.initial_cash_collected_usd;
			if (updateData.initial_payment_type !== undefined)
				cleanUpdateData.initial_payment_type = updateData.initial_payment_type;
			if (updateData.student_type !== undefined)
				cleanUpdateData.student_type = updateData.student_type;
			if (updateData.discord_channel_url !== undefined)
				cleanUpdateData.discord_channel_url = updateData.discord_channel_url;
			if (updateData.discord_channel_id !== undefined)
				cleanUpdateData.discord_channel_id = updateData.discord_channel_id;
			if (updateData.discord_username !== undefined)
				cleanUpdateData.discord_username = updateData.discord_username;
			if (updateData.internal_notes !== undefined)
				cleanUpdateData.internal_notes = updateData.internal_notes;

			// 4. Update the athlete record
			const { data: updatedAthlete, error: updateError } = await (
				supabase as any
			)
				.from("athletes")
				.update(cleanUpdateData)
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating athlete:", updateError);
				return returnValidationErrors(athleteUpdateSchema, {
					_errors: ["Failed to update athlete. Please try again."],
				});
			}

			if (!updatedAthlete) {
				return returnValidationErrors(athleteUpdateSchema, {
					_errors: ["Athlete update failed. Please try again."],
				});
			}

			// 5. Revalidate relevant paths
			revalidatePath("/dashboard/athletes");
			revalidatePath(`/dashboard/athletes/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Athlete updated successfully",
					athlete: updatedAthlete,
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateAthlete:", error);

			return returnValidationErrors(athleteUpdateSchema, {
				_errors: ["Failed to update athlete. Please try again."],
			});
		}
	});
