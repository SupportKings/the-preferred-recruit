"use server";


import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { addUser } from "@/features/team/actions/addUser";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

// Schema for coach creation
const coachSchema = z.object({
	email: z.string().email("Invalid email address"),
	name: z.string().min(2, "Name must be at least 2 characters"),
	maxClientUnits: z
		.number()
		.min(1, "Must have at least 1 client unit")
		.optional()
		.default(20),
	maxNewClientsPerWeek: z.number().min(1).optional(),
	isPremier: z.boolean().default(false),
});

export const addCoach = actionClient
	.inputSchema(coachSchema)
	.action(async ({ parsedInput }) => {
		const { email, name, maxClientUnits, maxNewClientsPerWeek, isPremier } =
			parsedInput;

		try {
			// 1. First create the user with appropriate role using the existing addUser function
			const userResult = await addUser({
				email,
				name,
				role: isPremier ? "premiereCoach" : "coach",
			});

			// Check if user creation failed
			if (userResult?.validationErrors?._errors) {
				return returnValidationErrors(coachSchema, {
					_errors: userResult.validationErrors._errors,
				});
			}

			// Check if the action succeeded and has data
			if (!userResult?.data) {
				return returnValidationErrors(coachSchema, {
					_errors: [
						"User creation failed. Please try again.",
					],
				});
			}

			// Now we can safely access the user data
			// The addUser returns { success: string; user: { user: UserWithRole } }
			const userData = userResult.data as { success: string; user: { user: { id: string } } };
			
			if (!userData.user?.user?.id) {
				return returnValidationErrors(coachSchema, {
					_errors: [
						"User created but coach profile setup failed. Please try again.",
					],
				});
			}

			const userId = userData.user.user.id;
			const supabase = await createClient();

			// 2. Create coach_capacity entry
			const { error: capacityError } = await supabase
				.from("coach_capacity")
				.insert({
					coach_id: userId,
					max_client_units: maxClientUnits,
					max_new_clients_per_week: maxNewClientsPerWeek || 2,
				});

			if (capacityError) {
				console.error("Error creating coach capacity:", capacityError);
				// Note: User was created successfully, but coach setup failed
				return returnValidationErrors(coachSchema, {
					_errors: [
						"User created but coach capacity setup failed. Please contact support.",
					],
				});
			}

			// 3. If isPremier, they will be able to have team members added to them later
			// No need to create a coach_teams entry immediately

		

			return {
				success: true,
				data: {
					success: "Coach created successfully",
					coach: {
						id: userId,
						name,
						email,
						isPremier,
						maxClientUnits,
						maxNewClientsPerWeek,
					},
				},
			};
		} catch (error) {
			console.error("Unexpected error in addCoach:", error);

			return returnValidationErrors(coachSchema, {
				_errors: ["Failed to create coach. Please try again."],
			});
		}
	});