"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

// Schema for updating a status
const updateAthleteStatusSchema = z.object({
	athleteId: z.string().uuid(),
	categoryName: z.string(),
	statusOptionId: z.number(),
});

// Get all status categories and options for athletes
export async function getAthleteStatusCategories() {
	try {
		const supabase = await createClient();

		// Get the athlete entity type
		const { data: entityType } = await (supabase as any)
			.from("entity_types")
			.select("id")
			.eq("name", "athlete")
			.single();

		if (!entityType) {
			return { categories: [], options: [] };
		}

		// Get all status categories for athletes
		const { data: categories, error: categoriesError } = await (supabase as any)
			.from("status_categories")
			.select("*")
			.eq("entity_type_id", entityType.id)
			.order("sort_order");

		if (categoriesError) {
			console.error("Error fetching status categories:", categoriesError);
			return { categories: [], options: [] };
		}

		// Get all status options for these categories
		const categoryIds = categories.map((c: any) => c.id);
		const { data: options, error: optionsError } = await (supabase as any)
			.from("status_options")
			.select("*")
			.in("status_category_id", categoryIds)
			.eq("is_active", true)
			.order("sort_order");

		if (optionsError) {
			console.error("Error fetching status options:", optionsError);
			return { categories, options: [] };
		}

		return { categories, options };
	} catch (error) {
		console.error("Error in getAthleteStatusCategories:", error);
		return { categories: [], options: [] };
	}
}

// Get current status values for a specific athlete
export async function getAthleteStatusValues(athleteId: string) {
	try {
		const supabase = await createClient();

		// Get entity type for athlete
		const { data: entityType } = await (supabase as any)
			.from("entity_types")
			.select("id")
			.eq("name", "athlete")
			.single();

		if (!entityType) {
			return { statusValues: [] };
		}

		// Get status categories for athlete
		const { data: categories } = await (supabase as any)
			.from("status_categories")
			.select("id, name, display_name")
			.eq("entity_type_id", entityType.id);

		if (!categories || categories.length === 0) {
			return { statusValues: [] };
		}

		// Get current status values for this athlete
		// Note: entity_id is stored as integer, but our athlete IDs are UUIDs
		// We need to query using a different approach
		const { data: statusValues, error } = await (supabase as any)
			.from("entity_status_values")
			.select(
				`
				id,
				entity_type,
				entity_id,
				status_category_id,
				status_option_id,
				set_at,
				set_by,
				status_category:status_categories(id, name, display_name),
				status_option:status_options(id, name, display_name, color, digit)
			`,
			)
			.eq("entity_type", "athlete")
			.in(
				"status_category_id",
				categories.map((c: any) => c.id),
			);

		if (error) {
			console.error("Error fetching status values:", error);
			return { statusValues: [] };
		}

		// Filter to only include values for the specific athlete
		const filteredValues =
			statusValues?.filter((sv: any) => sv.entity_id === athleteId) || [];

		return { statusValues: filteredValues, categories };
	} catch (error) {
		console.error("Error in getAthleteStatusValues:", error);
		return { statusValues: [] };
	}
}

// Update a status value for an athlete
export const updateAthleteStatusAction = actionClient
	.schema(updateAthleteStatusSchema)
	.action(async ({ parsedInput }) => {
		try {
			const user = await getUser();
			if (!user) {
				return returnValidationErrors(updateAthleteStatusSchema, {
					_errors: ["You must be logged in to update status"],
				});
			}

			const supabase = await createClient();
			const { athleteId, categoryName, statusOptionId } = parsedInput;

			// Get the category ID from the category name
			const { data: entityType } = await (supabase as any)
				.from("entity_types")
				.select("id")
				.eq("name", "athlete")
				.single();

			if (!entityType) {
				return returnValidationErrors(updateAthleteStatusSchema, {
					_errors: ["Athlete entity type not found"],
				});
			}

			const { data: category } = await (supabase as any)
				.from("status_categories")
				.select("id")
				.eq("entity_type_id", entityType.id)
				.eq("name", categoryName)
				.single();

			if (!category) {
				return returnValidationErrors(updateAthleteStatusSchema, {
					categoryName: { _errors: ["Invalid status category"] },
				});
			}

			// Get current status value if exists
			const { data: currentStatus } = await (supabase as any)
				.from("entity_status_values")
				.select("id, status_option_id")
				.eq("entity_type", "athlete")
				.eq("entity_id", athleteId)
				.eq("status_category_id", category.id)
				.maybeSingle();

			const oldStatusOptionId = currentStatus?.status_option_id || null;

			// Upsert the status value
			if (currentStatus) {
				// Update existing
				const { error: updateError } = await (supabase as any)
					.from("entity_status_values")
					.update({
						status_option_id: statusOptionId,
						set_at: new Date().toISOString(),
						set_by: null, // Would need team_member_id mapping from user
					})
					.eq("id", currentStatus.id);

				if (updateError) {
					console.error("Error updating status:", updateError);
					return returnValidationErrors(updateAthleteStatusSchema, {
						_errors: ["Failed to update status"],
					});
				}
			} else {
				// Insert new
				const { error: insertError } = await (supabase as any)
					.from("entity_status_values")
					.insert({
						entity_type: "athlete",
						entity_id: athleteId,
						status_category_id: category.id,
						status_option_id: statusOptionId,
						set_at: new Date().toISOString(),
						set_by: null,
					});

				if (insertError) {
					console.error("Error inserting status:", insertError);
					return returnValidationErrors(updateAthleteStatusSchema, {
						_errors: ["Failed to set status"],
					});
				}
			}

			// Log the status change
			await (supabase as any).from("status_change_log").insert({
				entity_type: "athlete",
				entity_id: athleteId,
				status_category_id: category.id,
				old_status_option_id: oldStatusOptionId,
				new_status_option_id: statusOptionId,
				changed_by: null, // Would need team_member_id mapping from user
				changed_at: new Date().toISOString(),
			});

			revalidatePath(`/dashboard/athletes/${athleteId}`);

			return {
				success: true,
				data: { message: "Status updated successfully" },
			};
		} catch (error) {
			console.error("Error in updateAthleteStatusAction:", error);
			return returnValidationErrors(updateAthleteStatusSchema, {
				_errors: [
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
				],
			});
		}
	});
