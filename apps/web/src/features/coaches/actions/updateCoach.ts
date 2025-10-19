"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

// Update schema - only fields that can be edited in detail view
const coachUpdateSchema = z.object({
	id: z.string().uuid({ message: "Invalid ID format" }),
	full_name: z
		.string()
		.min(2, "Must be at least 2 characters")
		.max(100, "Must be less than 100 characters")
		.optional(),
	primary_specialty: z
		.enum([
			"sprints",
			"hurdles",
			"distance",
			"jumps",
			"throws",
			"relays",
			"combined",
		])
		.optional(),
	email: z.string().email("Invalid email").optional().or(z.literal("")),
	phone: z.string().optional().or(z.literal("")),
	twitter_profile: z.string().optional().or(z.literal("")),
	linkedin_profile: z.string().optional().or(z.literal("")),
	instagram_profile: z.string().optional().or(z.literal("")),
	internal_notes: z.string().optional().or(z.literal("")),
});

export const updateCoachAction = actionClient
	.inputSchema(coachUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if coach exists
			const { data: existingCoach, error: fetchError } = await supabase
				.from("coaches")
				.select("id, email")
				.eq("id", id)
				.single();

			if (fetchError || !existingCoach) {
				return returnValidationErrors(coachUpdateSchema, {
					_errors: ["Coach not found"],
				});
			}

			// 2. If email is being updated, check for conflicts
			if (updateData.email && updateData.email !== existingCoach.email) {
				const { data: emailConflict } = await supabase
					.from("coaches")
					.select("id")
					.eq("email", updateData.email)
					.neq("id", id)
					.single();

				if (emailConflict) {
					return returnValidationErrors(coachUpdateSchema, {
						email: {
							_errors: ["A coach with this email already exists"],
						},
					});
				}
			}

			// 3. Prepare update data (remove empty strings, keep undefined as is)
			const cleanUpdateData: Record<string, any> = {};

			if (updateData.full_name !== undefined) {
				cleanUpdateData.full_name = updateData.full_name;
			}
			if (updateData.primary_specialty !== undefined) {
				cleanUpdateData.primary_specialty = updateData.primary_specialty;
			}
			if (updateData.email !== undefined) {
				cleanUpdateData.email =
					updateData.email === "" ? null : updateData.email;
			}
			if (updateData.phone !== undefined) {
				cleanUpdateData.phone =
					updateData.phone === "" ? null : updateData.phone;
			}
			if (updateData.twitter_profile !== undefined) {
				cleanUpdateData.twitter_profile =
					updateData.twitter_profile === "" ? null : updateData.twitter_profile;
			}
			if (updateData.linkedin_profile !== undefined) {
				cleanUpdateData.linkedin_profile =
					updateData.linkedin_profile === ""
						? null
						: updateData.linkedin_profile;
			}
			if (updateData.instagram_profile !== undefined) {
				cleanUpdateData.instagram_profile =
					updateData.instagram_profile === ""
						? null
						: updateData.instagram_profile;
			}
			if (updateData.internal_notes !== undefined) {
				cleanUpdateData.internal_notes =
					updateData.internal_notes === "" ? null : updateData.internal_notes;
			}

			// 4. Update the coach record
			const { data: updatedCoach, error: updateError } = await supabase
				.from("coaches")
				.update(cleanUpdateData)
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating coach:", updateError);
				return returnValidationErrors(coachUpdateSchema, {
					_errors: ["Failed to update coach. Please try again."],
				});
			}

			if (!updatedCoach) {
				return returnValidationErrors(coachUpdateSchema, {
					_errors: ["Coach update failed. Please try again."],
				});
			}

			// 5. Revalidate relevant paths
			revalidatePath("/dashboard/coaches");
			revalidatePath(`/dashboard/coaches/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "Coach updated successfully",
					coach: updatedCoach,
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateCoach:", error);

			return returnValidationErrors(coachUpdateSchema, {
				_errors: ["Failed to update coach. Please try again."],
			});
		}
	});
