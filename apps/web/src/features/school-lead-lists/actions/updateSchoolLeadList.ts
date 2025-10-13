"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const schoolLeadListUpdateSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).optional(),
	priority: z.number().int().min(0).nullable().optional(),
	type: z.string().nullable().optional(),
	internal_notes: z.string().nullable().optional(),
});

export const updateSchoolLeadListAction = actionClient
	.inputSchema(schoolLeadListUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, ...updateData } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if lead list exists
			const { data: existingLeadList, error: fetchError } = await supabase
				.from("school_lead_lists")
				.select("id")
				.eq("id", id)
				.single();

			if (fetchError || !existingLeadList) {
				return returnValidationErrors(schoolLeadListUpdateSchema, {
					_errors: ["School lead list not found"],
				});
			}

			// 2. Prepare update data
			const cleanUpdateData: any = {};

			if (updateData.name !== undefined) cleanUpdateData.name = updateData.name;
			if (updateData.priority !== undefined)
				cleanUpdateData.priority = updateData.priority;
			if (updateData.type !== undefined) cleanUpdateData.type = updateData.type;
			if (updateData.internal_notes !== undefined)
				cleanUpdateData.internal_notes = updateData.internal_notes;

			// 3. Update the lead list record
			const { data: updatedLeadList, error: updateError } = await supabase
				.from("school_lead_lists")
				.update({
					...cleanUpdateData,
					updated_at: new Date().toISOString(),
				})
				.eq("id", id)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating school lead list:", updateError);
				return returnValidationErrors(schoolLeadListUpdateSchema, {
					_errors: ["Failed to update school lead list. Please try again."],
				});
			}

			if (!updatedLeadList) {
				return returnValidationErrors(schoolLeadListUpdateSchema, {
					_errors: ["School lead list update failed. Please try again."],
				});
			}

			// 4. Revalidate relevant paths
			revalidatePath("/dashboard/school-lead-lists");
			revalidatePath(`/dashboard/school-lead-lists/${id}`);
			revalidatePath("/dashboard");

			return {
				success: true,
				data: {
					success: "School lead list updated successfully",
					leadList: updatedLeadList,
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateSchoolLeadList:", error);

			return returnValidationErrors(schoolLeadListUpdateSchema, {
				_errors: ["Failed to update school lead list. Please try again."],
			});
		}
	});
